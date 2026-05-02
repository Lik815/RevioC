import bcrypt from 'bcrypt';
import type { FastifyReply } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { sha256 } from '../../utils/hash.js';
import { generateToken } from '../../utils/token.js';
import { getEnv } from '../../env.js';
import type { JwtPayload } from '../../plugins/jwt.js';

// Pre-computed valid bcrypt hash to use for timing-safe comparison when user not found.
const DUMMY_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsClt7PUG0sGPJhB9fGbRkWaFmS.';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;       // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;           // 1 hour
const REFRESH_COOKIE_NAME = 'revio_refresh_token';

export class AuthError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

function cookieOptions(maxAge: number) {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.NODE_ENV !== 'development',
    sameSite: 'strict' as const,
    path: '/auth/refresh',
    maxAge,
  };
}

// ── Register ─────────────────────────────────────────────────────────────────

export async function register(
  body: {
    email: string;
    password: string;
    role: 'patient' | 'therapist';
    firstName: string;
    lastName: string;
    phone?: string;
    licenseNumber?: string;
  },
  prisma: PrismaClient,
) {
  const email = body.email.trim().toLowerCase();

  const existing = await (prisma as any).userV2.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const rawToken = generateToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await (prisma as any).$transaction(async (tx: any) => {
    const user = await tx.userV2.create({
      data: {
        email,
        passwordHash,
        role: body.role,
        isVerified: false,
      },
    });

    if (body.role === 'patient') {
      await tx.patientProfile.create({
        data: {
          userId: user.id,
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone ?? null,
        },
      });
    } else {
      await tx.therapistProfileV2.create({
        data: {
          userId: user.id,
          firstName: body.firstName,
          lastName: body.lastName,
          licenseNumber: body.licenseNumber ?? null,
        },
      });
    }

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  const env = getEnv();
  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;

  return {
    message: 'User created. Please verify your email.',
    verificationLink,
  };
}

// ── Verify Email ──────────────────────────────────────────────────────────────

export async function verifyEmail(token: string, prisma: PrismaClient) {
  const tokenHash = sha256(token);
  const now = new Date();

  const record = await (prisma as any).emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt !== null || record.expiresAt < now) {
    throw new AuthError(400, 'Invalid or expired verification token.');
  }

  await (prisma as any).$transaction(async (tx: any) => {
    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    });
    await tx.userV2.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });
  });

  return { message: 'Email verified.' };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(
  body: { email: string; password: string },
  prisma: PrismaClient,
  jwtSign: (payload: Omit<JwtPayload, 'iat' | 'exp'>) => string,
  reply: FastifyReply,
  log: { info: (obj: object) => void },
) {
  const email = body.email.trim().toLowerCase();

  const user = await (prisma as any).userV2.findUnique({ where: { email } });

  // Always run bcrypt to prevent timing-based email enumeration
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(body.password, hashToCompare);

  if (!user || !passwordMatch) {
    throw new AuthError(401, 'Invalid credentials.');
  }

  if (!user.isVerified) {
    throw new AuthError(403, 'Please verify your email before logging in.');
  }

  const accessToken = jwtSign({ sub: user.id, role: user.role });

  const rawRefresh = generateToken();
  const refreshHash = sha256(rawRefresh);
  await (prisma as any).refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  reply.setCookie(REFRESH_COOKIE_NAME, rawRefresh, cookieOptions(REFRESH_TOKEN_TTL_MS / 1000));

  log.info({ event: 'login', userId: user.id });

  return { accessToken, expiresIn: 900 };
}

// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refresh(
  rawRefresh: string | undefined,
  prisma: PrismaClient,
  jwtSign: (payload: Omit<JwtPayload, 'iat' | 'exp'>) => string,
  reply: FastifyReply,
  log: { warn: (obj: object) => void },
) {
  if (!rawRefresh) throw new AuthError(401, 'Missing refresh token.');

  const tokenHash = sha256(rawRefresh);
  const record = await (prisma as any).refreshToken.findUnique({ where: { tokenHash } });

  if (!record) {
    throw new AuthError(401, 'Invalid refresh token.');
  }

  // Reuse attack: token was already revoked
  if (record.revokedAt !== null) {
    await (prisma as any).refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    log.warn({ event: 'reuse_attack_detected', userId: record.userId });
    throw new AuthError(401, 'Token reuse detected. All sessions revoked.');
  }

  if (record.expiresAt < new Date()) {
    throw new AuthError(401, 'Refresh token expired.');
  }

  const user = await (prisma as any).userV2.findUnique({ where: { id: record.userId } });
  if (!user) throw new AuthError(401, 'User not found.');

  const newRawRefresh = generateToken();
  const newRefreshHash = sha256(newRawRefresh);
  const now = new Date();

  await (prisma as any).$transaction(async (tx: any) => {
    await tx.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: now },
    });
    await tx.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshHash,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
      },
    });
  });

  reply.setCookie(REFRESH_COOKIE_NAME, newRawRefresh, cookieOptions(REFRESH_TOKEN_TTL_MS / 1000));

  const accessToken = jwtSign({ sub: user.id, role: user.role });
  return { accessToken, expiresIn: 900 };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(
  rawRefresh: string | undefined,
  prisma: PrismaClient,
  reply: FastifyReply,
  log: { info: (obj: object) => void },
) {
  if (rawRefresh) {
    const tokenHash = sha256(rawRefresh);
    const record = await (prisma as any).refreshToken.findUnique({ where: { tokenHash } });
    if (record) {
      await (prisma as any).refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });
      log.info({ event: 'logout', userId: record.userId });
    }
  }

  reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth/refresh' });
  return { message: 'Logged out.' };
}

// ── Request Password Reset ────────────────────────────────────────────────────

export async function requestPasswordReset(email: string, prisma: PrismaClient) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await (prisma as any).userV2.findUnique({ where: { email: normalizedEmail } });

  const response: { message: string; resetLink?: string } = {
    message: 'If this email exists, a reset link has been sent.',
  };

  if (!user) return response;

  const rawToken = generateToken();
  const tokenHash = sha256(rawToken);

  await (prisma as any).passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });

  const env = getEnv();
  response.resetLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

  return response;
}

// ── Confirm Password Reset ────────────────────────────────────────────────────

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
  prisma: PrismaClient,
  log: { info: (obj: object) => void },
) {
  const tokenHash = sha256(token);
  const now = new Date();

  const record = await (prisma as any).passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt !== null || record.expiresAt < now) {
    throw new AuthError(400, 'Invalid or expired reset token.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await (prisma as any).$transaction(async (tx: any) => {
    await tx.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    });
    await tx.userV2.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    // Revoke all active refresh tokens — force re-login everywhere
    await tx.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: now },
    });
  });

  log.info({ event: 'password_reset', userId: record.userId });

  return { message: 'Password updated.' };
}

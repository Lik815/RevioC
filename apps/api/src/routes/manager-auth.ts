import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hashPassword, verifyPassword, getToken } from './auth-utils.js';
import { randomBytes } from 'crypto';
import { geocodeAddress } from '../utils/geocode.js';

// ── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  practiceName: z.string().min(2),
  practiceCity: z.string().min(2),
  practiceAddress: z.string().optional(),
  practicePhone: z.string().optional(),
  // If the manager is also a therapist:
  isTherapist: z.boolean().default(false),
  fullName: z.string().optional(),
  professionalTitle: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updatePracticeSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().nullable().optional(),
  photos: z.string().nullable().optional(),
});

// ── Helper ───────────────────────────────────────────────────────────────────

async function getManagerByToken(fastify: any, token: string) {
  return fastify.prisma.practiceManager.findUnique({
    where: { sessionToken: token },
    include: {
      practice: true,
      therapist: {
        select: {
          id: true, fullName: true, professionalTitle: true,
          city: true, bio: true, photo: true,
          specializations: true, languages: true,
          isVisible: true, isPublished: true, reviewStatus: true,
        },
      },
    },
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const managerAuthRoutes: FastifyPluginAsync = async (fastify) => {

  // POST /manager/register
  // Creates a PracticeManager + Practice.
  // If isTherapist=true, also creates a linked Therapist profile (unpublished).
  fastify.post('/manager/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.flatten().toString());

    const {
      email, password,
      practiceName, practiceCity, practiceAddress, practicePhone,
      isTherapist, fullName, professionalTitle,
    } = parsed.data;

    if (isTherapist && (!fullName || !professionalTitle)) {
      return reply.badRequest('fullName und professionalTitle sind erforderlich wenn isTherapist=true');
    }

    // Check email not already used
    const existingUser = await fastify.prisma.user.findUnique({ where: { email } });
    if (existingUser) return reply.conflict('E-Mail wird bereits verwendet');

    const existingManager = await fastify.prisma.practiceManager.findUnique({ where: { email } });
    if (existingManager) return reply.conflict('E-Mail wird bereits verwendet');

    const existingTherapist = await fastify.prisma.therapist.findUnique({ where: { email } });
    if (existingTherapist) return reply.conflict('E-Mail wird bereits verwendet');

    const passwordHash = await hashPassword(password);
    const isDev = process.env.NODE_ENV !== 'production';

    // Geocode practice address
    const geo = await geocodeAddress(practiceAddress ?? '', practiceCity);

    // Create practice
    const practice = await fastify.prisma.practice.create({
      data: {
        name: practiceName,
        city: practiceCity,
        address: practiceAddress,
        phone: practicePhone,
        reviewStatus: isDev ? 'APPROVED' : 'PENDING_REVIEW',
        ...(geo ? { lat: geo.lat, lng: geo.lng } : {}),
      },
    });

    // Optionally create therapist profile (unpublished, hidden by default)
    let therapist = null;
    if (isTherapist) {
      therapist = await fastify.prisma.therapist.create({
        data: {
          email,
          fullName: fullName!,
          professionalTitle: professionalTitle!,
          city: practiceCity,
          specializations: '',
          languages: '',
          reviewStatus: isDev ? 'APPROVED' : 'PENDING_REVIEW',
          isVisible: false,
          isPublished: false,
          visibilityPreference: 'hidden',
          onboardingStatus: 'manager_onboarding',
        },
      });

      // Auto-link therapist to practice as CONFIRMED
      await fastify.prisma.therapistPracticeLink.create({
        data: { therapistId: therapist.id, practiceId: practice.id, status: 'CONFIRMED' },
      });
    }

    // Create user + manager account
    const sessionToken = randomBytes(32).toString('hex');
    const user = await fastify.prisma.user.create({
      data: { email, passwordHash, role: 'manager', sessionToken },
    });
    if (therapist) {
      await fastify.prisma.therapist.update({
        where: { id: therapist.id },
        data: { userId: user.id },
      });
    }
    const manager = await fastify.prisma.practiceManager.create({
      data: {
        email,
        userId: user.id,
        passwordHash,
        sessionToken,
        practiceId: practice.id,
        therapistId: therapist?.id ?? null,
      },
    });

    return reply.status(201).send({
      token: sessionToken,
      managerId: manager.id,
      practiceId: practice.id,
      isTherapist,
      therapistId: therapist?.id ?? null,
    });
  });

  // POST /manager/login
  fastify.post('/manager/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.flatten().toString());

    const { email, password } = parsed.data;

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'manager' || !user.passwordHash) return reply.unauthorized('Ungültige Zugangsdaten');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return reply.unauthorized('Ungültige Zugangsdaten');

    const manager = await fastify.prisma.practiceManager.findFirst({
      where: { userId: user.id },
    });
    if (!manager) return reply.unauthorized('Manager-Profil nicht gefunden');

    const token = randomBytes(32).toString('hex');
    await fastify.prisma.user.update({
      where: { id: user.id },
      data: { sessionToken: token },
    });
    await fastify.prisma.practiceManager.update({
      where: { id: manager.id },
      data: { sessionToken: token },
    });

    return { token, managerId: manager.id, practiceId: manager.practiceId };
  });

  // GET /manager/me
  fastify.get('/manager/me', async (request, reply) => {
    const token = getToken(request);
    if (!token) return reply.unauthorized('Kein Token');

    const manager = await getManagerByToken(fastify, token);
    if (!manager) return reply.unauthorized('Ungültiger Token');

    const practice = await fastify.prisma.practice.findUnique({
      where: { id: manager.practiceId },
      include: {
        links: {
          where: { status: 'CONFIRMED' },
          include: {
            therapist: {
              select: {
                id: true, fullName: true, professionalTitle: true,
                photo: true, email: true, onboardingStatus: true,
                isPublished: true, invitedByPracticeId: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      id: manager.id,
      email: manager.email,
      isTherapist: !!manager.therapistId,
      therapistProfile: manager.therapist ?? null,
      practice: practice ? {
        id: practice.id,
        name: practice.name,
        city: practice.city,
        address: practice.address,
        phone: practice.phone,
        hours: practice.hours,
        description: practice.description,
        logo: practice.logo,
        photos: practice.photos,
        lat: practice.lat,
        lng: practice.lng,
        reviewStatus: practice.reviewStatus,
        therapists: practice.links.map((l: any) => l.therapist),
      } : null,
    };
  });

  // PATCH /manager/practice — update the manager's practice
  fastify.patch('/manager/practice', async (request, reply) => {
    const token = getToken(request);
    if (!token) return reply.unauthorized('Kein Token');

    const manager = await fastify.prisma.practiceManager.findUnique({ where: { sessionToken: token } });
    if (!manager) return reply.unauthorized('Ungültiger Token');

    const parsed = updatePracticeSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.flatten().toString());

    const d = parsed.data;
    const practice = await fastify.prisma.practice.findUnique({ where: { id: manager.practiceId } });
    if (!practice) return reply.notFound('Praxis nicht gefunden');

    const needsGeocode = d.address !== undefined || d.city !== undefined;
    let geoUpdate = {};
    if (needsGeocode) {
      const geo = await geocodeAddress(d.address ?? practice.address ?? '', d.city ?? practice.city);
      if (geo) geoUpdate = { lat: geo.lat, lng: geo.lng };
    }

    const updated = await fastify.prisma.practice.update({
      where: { id: practice.id },
      data: { ...d, ...geoUpdate },
    });

    return { practice: updated };
  });

  // POST /manager/logout
  fastify.post('/manager/logout', async (request) => {
    const token = getToken(request);
    if (token) {
      await fastify.prisma.practiceManager.updateMany({
        where: { sessionToken: token },
        data: { sessionToken: null },
      });
    }
    return { success: true };
  });
};

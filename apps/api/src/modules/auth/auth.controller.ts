import type { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import {
  registerBodySchema,
  verifyEmailBodySchema,
  loginBodySchema,
  passwordResetRequestBodySchema,
  passwordResetConfirmBodySchema,
} from './auth.schema.js';
import * as service from './auth.service.js';
import { AuthError } from './auth.service.js';

function handleError(err: unknown, reply: FastifyReply) {
  if (err instanceof AuthError) {
    return reply.status(err.statusCode).send({
      statusCode: err.statusCode,
      error: err.statusCode === 409 ? 'Conflict' : err.statusCode === 403 ? 'Forbidden' : err.statusCode === 401 ? 'Unauthorized' : 'Bad Request',
      message: err.message,
    });
  }
  if (err instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    });
  }
  throw err;
}

export async function registerController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = registerBodySchema.parse(request.body);
    const result = await service.register(body, request.server.prisma as any);
    return reply.status(201).send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

export async function verifyEmailController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = verifyEmailBodySchema.parse(request.body);
    const result = await service.verifyEmail(body.token, request.server.prisma as any);
    return reply.send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = loginBodySchema.parse(request.body);
    const result = await service.login(body, request.server.prisma as any, request.server.jwtSign, reply, request.server.log);
    return reply.send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

export async function refreshController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const rawRefresh = (request.cookies as any)?.revio_refresh_token;
    const result = await service.refresh(rawRefresh, request.server.prisma as any, request.server.jwtSign, reply, request.server.log);
    return reply.send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

export async function logoutController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const rawRefresh = (request.cookies as any)?.revio_refresh_token;
    const result = await service.logout(rawRefresh, request.server.prisma as any, reply, request.server.log);
    return reply.send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

export async function requestPasswordResetController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = passwordResetRequestBodySchema.parse(request.body);
    const result = await service.requestPasswordReset(body.email, request.server.prisma as any);
    return reply.send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

export async function confirmPasswordResetController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = passwordResetConfirmBodySchema.parse(request.body);
    const result = await service.confirmPasswordReset(body.token, body.newPassword, request.server.prisma as any, request.server.log);
    return reply.send(result);
  } catch (err) {
    return handleError(err, reply);
  }
}

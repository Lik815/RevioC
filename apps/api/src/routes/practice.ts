import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { getToken } from './auth-utils.js';

async function getAuthedTherapist(request: any, fastify: any) {
  const token = getToken(request);
  if (!token) return null;
  return fastify.prisma.therapist.findUnique({ where: { sessionToken: token } });
}

export const practiceRoutes: FastifyPluginAsync = async (fastify) => {

  // POST /practice — create new practice, therapist becomes admin
  fastify.post('/practice', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const existing = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (existing) return reply.conflict('Du bist bereits Admin einer Praxis');

    const schema = z.object({
      name: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional(),
      phone: z.string().optional(),
      hours: z.string().optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.flatten().toString());

    const practice = await fastify.prisma.practice.create({
      data: {
        ...parsed.data,
        adminTherapistId: therapist.id,
        reviewStatus: process.env.NODE_ENV === 'production' ? 'PENDING_REVIEW' : 'APPROVED',
      },
    });

    // Auto-link the therapist to the practice as CONFIRMED
    await fastify.prisma.therapistPracticeLink.create({
      data: { therapistId: therapist.id, practiceId: practice.id, status: 'CONFIRMED' },
    });

    return reply.status(201).send({ practice });
  });

  // GET /practice/search?q=&city= — search approved practices
  fastify.get('/practice/search', async (request, reply) => {
    const { q = '', city = '' } = request.query as { q?: string; city?: string };
    const practices = await fastify.prisma.practice.findMany({
      where: {
        reviewStatus: 'APPROVED',
        ...(q ? {
          OR: [
            { name: { contains: q } },
            { city: { contains: q } },
            { address: { contains: q } },
          ],
        } : {}),
        ...(city ? { city: { contains: city } } : {}),
      },
      include: {
        links: {
          where: { status: 'CONFIRMED' },
          include: {
            therapist: { select: { id: true, fullName: true, professionalTitle: true } },
          },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
    return { practices };
  });

  // POST /practice/:id/connect — send connection request to a practice
  fastify.post('/practice/:id/connect', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const { id: practiceId } = request.params as { id: string };
    const practice = await fastify.prisma.practice.findUnique({ where: { id: practiceId } });
    if (!practice || practice.reviewStatus !== 'APPROVED') {
      return reply.notFound('Praxis nicht gefunden');
    }

    const existingLink = await fastify.prisma.therapistPracticeLink.findUnique({
      where: { therapistId_practiceId: { therapistId: therapist.id, practiceId } },
    });
    if (existingLink) return reply.conflict('Anfrage bereits gesendet oder bereits verbunden');

    const link = await fastify.prisma.therapistPracticeLink.create({
      data: { therapistId: therapist.id, practiceId, status: 'PROPOSED' },
    });
    return reply.status(201).send({ link });
  });

  // GET /my/practice — get the practice this therapist admins (full detail)
  fastify.get('/my/practice', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
      include: {
        links: {
          include: {
            therapist: {
              select: {
                id: true,
                fullName: true,
                professionalTitle: true,
                photo: true,
                specializations: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!practice) return reply.notFound('Keine eigene Praxis');
    return { practice };
  });

  // PATCH /my/practice — update practice info (admin only)
  fastify.patch('/my/practice', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (!practice) return reply.forbidden('Kein Praxis-Admin');

    const schema = z.object({
      name: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      hours: z.string().optional(),
      description: z.string().optional(),
      logo: z.string().optional(),
      photos: z.string().optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.flatten().toString());

    const updated = await fastify.prisma.practice.update({
      where: { id: practice.id },
      data: parsed.data,
    });
    return { practice: updated };
  });

  // PATCH /my/practice/links/:linkId — accept or reject a connection request
  fastify.patch('/my/practice/links/:linkId', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (!practice) return reply.forbidden('Kein Praxis-Admin');

    const { linkId } = request.params as { linkId: string };
    const { action } = request.body as { action: 'accept' | 'reject' };

    const link = await fastify.prisma.therapistPracticeLink.findUnique({ where: { id: linkId } });
    if (!link || link.practiceId !== practice.id) return reply.notFound('Link nicht gefunden');

    const updated = await fastify.prisma.therapistPracticeLink.update({
      where: { id: linkId },
      data: { status: action === 'accept' ? 'CONFIRMED' : 'REJECTED' },
    });
    return { link: updated };
  });

  // POST /my/practice/invite — invite a therapist by email
  fastify.post('/my/practice/invite', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (!practice) return reply.forbidden('Kein Praxis-Admin');

    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.flatten().toString());

    const invitee = await fastify.prisma.therapist.findUnique({
      where: { email: parsed.data.email },
    });
    if (!invitee) return reply.notFound('Therapeut nicht gefunden');

    const existingLink = await fastify.prisma.therapistPracticeLink.findUnique({
      where: { therapistId_practiceId: { therapistId: invitee.id, practiceId: practice.id } },
    });
    if (existingLink) return reply.conflict('Therapeut bereits verknüpft oder Einladung ausstehend');

    const link = await fastify.prisma.therapistPracticeLink.create({
      data: { therapistId: invitee.id, practiceId: practice.id, status: 'PROPOSED', initiatedBy: 'ADMIN' } as any,
    });
    return reply.status(201).send({ link });
  });

  // GET /my/practice/invite-token — get or create shareable invite token
  fastify.get('/my/practice/invite-token', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (!practice) return reply.forbidden('Kein Praxis-Admin');

    let token = (practice as any).inviteToken;
    if (!token) {
      token = randomBytes(12).toString('hex');
      await (fastify.prisma as any).practice.update({
        where: { id: practice.id },
        data: { inviteToken: token },
      });
    }
    return { token, practiceId: practice.id, practiceName: practice.name };
  });

  // POST /practice/join/:token — therapist joins via invite link
  fastify.post('/practice/join/:token', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const { token } = request.params as { token: string };
    const practice = await (fastify.prisma as any).practice.findUnique({
      where: { inviteToken: token },
    });
    if (!practice || practice.reviewStatus !== 'APPROVED') return reply.notFound('Einladung ungültig');

    const existing = await fastify.prisma.therapistPracticeLink.findUnique({
      where: { therapistId_practiceId: { therapistId: therapist.id, practiceId: practice.id } },
    });
    if (existing) return reply.conflict('Bereits verbunden oder Anfrage ausstehend');

    const link = await fastify.prisma.therapistPracticeLink.create({
      data: { therapistId: therapist.id, practiceId: practice.id, status: 'PROPOSED', initiatedBy: 'THERAPIST' } as any,
    });
    return reply.status(201).send({ link, practiceName: practice.name });
  });

  // GET /therapists/search?q= — search approved therapists by name or email
  fastify.get('/therapists/search', async (request) => {
    const { q = '' } = request.query as { q?: string };
    if (q.length < 2) return { therapists: [] };

    const therapists = await fastify.prisma.therapist.findMany({
      where: {
        reviewStatus: 'APPROVED',
        OR: [
          { fullName: { contains: q } },
          { email: { contains: q } },
        ],
      },
      select: { id: true, fullName: true, professionalTitle: true, email: true, city: true, photo: true },
      take: 10,
    });
    return { therapists };
  });

  // DELETE /my/practice/invite/:therapistId — cancel a pending invite
  fastify.delete('/my/practice/invite/:therapistId', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (!practice) return reply.forbidden('Kein Praxis-Admin');

    const { therapistId } = request.params as { therapistId: string };
    const link = await fastify.prisma.therapistPracticeLink.findUnique({
      where: { therapistId_practiceId: { therapistId, practiceId: practice.id } },
    });
    if (!link || link.status !== 'PROPOSED') return reply.notFound('Ausstehende Einladung nicht gefunden');

    await fastify.prisma.therapistPracticeLink.delete({ where: { id: link.id } });
    return { success: true };
  });

  // DELETE /my/practice/links/:linkId — remove a therapist from the practice
  fastify.delete('/my/practice/links/:linkId', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const practice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
    });
    if (!practice) return reply.forbidden('Kein Praxis-Admin');

    const { linkId } = request.params as { linkId: string };
    const link = await fastify.prisma.therapistPracticeLink.findUnique({ where: { id: linkId } });
    if (!link || link.practiceId !== practice.id) return reply.notFound('Link nicht gefunden');

    await fastify.prisma.therapistPracticeLink.delete({ where: { id: linkId } });
    return { success: true };
  });

  // GET /notifications — returns pending notifications for the logged-in therapist
  fastify.get('/notifications', async (request, reply) => {
    const therapist = await getAuthedTherapist(request, fastify);
    if (!therapist) return reply.unauthorized('Kein Token');

    const notifications: { id: string; type: string; message: string; createdAt: Date }[] = [];

    // Admin notifications: therapist-initiated join requests (initiatedBy = THERAPIST)
    const adminPractice = await fastify.prisma.practice.findFirst({
      where: { adminTherapistId: therapist.id },
      include: {
        links: {
          where: { status: 'PROPOSED', initiatedBy: 'THERAPIST' } as any,
          include: { therapist: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (adminPractice) {
      for (const link of adminPractice.links) {
        notifications.push({
          id: link.id,
          type: 'JOIN_REQUEST',
          message: `${link.therapist.fullName} möchte deiner Praxis beitreten.`,
          createdAt: link.createdAt,
        });
      }
    }

    // Therapist notifications: admin-initiated invites (initiatedBy = ADMIN)
    const invites = await (fastify.prisma as any).therapistPracticeLink.findMany({
      where: { therapistId: therapist.id, status: 'PROPOSED', initiatedBy: 'ADMIN' },
      include: { practice: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    for (const link of invites) {
      notifications.push({
        id: link.id,
        type: 'INVITE',
        message: `${link.practice.name} hat dich eingeladen, der Praxis beizutreten.`,
        createdAt: link.createdAt,
      });
    }

    return { notifications };
  });
};

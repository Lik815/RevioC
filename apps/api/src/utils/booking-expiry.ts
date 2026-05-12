import { FastifyInstance } from 'fastify';

export async function expireStaleBookings(fastify: FastifyInstance, where: Record<string, unknown> = {}) {
  const stale = await fastify.prisma.bookingRequest.findMany({
    where: { ...where, status: 'PENDING', responseDueAt: { lt: new Date() } },
    select: { id: true, slotId: true },
  });
  if (stale.length === 0) return;
  await fastify.prisma.$transaction([
    fastify.prisma.bookingRequest.updateMany({
      where: { id: { in: stale.map((b) => b.id) } },
      data: { status: 'EXPIRED' },
    }),
    ...stale
      .filter((b) => b.slotId)
      .map((b) =>
        fastify.prisma.therapistSlot.update({
          where: { id: b.slotId! },
          data: { status: 'AVAILABLE' },
        }),
      ),
  ]);
}

import { FastifyPluginAsync } from 'fastify';
import { ensureDefaultCertificationOptions } from '../utils/certification-options.js';
import { getPublicSiteSettings } from '../utils/app-settings.js';

export const configRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/config/site', async () => {
    return getPublicSiteSettings(fastify.prisma);
  });

  fastify.get('/config/options', async () => {
    await ensureDefaultCertificationOptions(fastify.prisma);

    const certifications = await fastify.prisma.certificationOption.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });

    return {
      certifications: certifications.map((option) => ({
        key: option.key,
        label: option.label,
      })),
      site: await getPublicSiteSettings(fastify.prisma),
    };
  });
};

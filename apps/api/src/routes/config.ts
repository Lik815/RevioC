import { FastifyPluginAsync } from 'fastify';
import { ensureDefaultCertificationOptions } from '../utils/certification-options.js';
import { getPublicSiteSettings } from '../utils/app-settings.js';

export const configRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/config/site', async () => {
    return getPublicSiteSettings(fastify.prisma);
  });

  fastify.get('/config/blog-posts', async () => {
    const posts = await fastify.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      posts: posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        authorName: post.authorName,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
    };
  });

  fastify.get('/config/blog-posts/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const post = await fastify.prisma.blogPost.findUnique({ where: { slug } });

    if (!post || !post.isPublished) return reply.notFound('Blogpost nicht gefunden');

    return {
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        authorName: post.authorName,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    };
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

import type { FastifyPluginAsync } from 'fastify';
import * as controller from './auth.controller.js';

export const authV2Routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/register', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 hour',
      },
    },
    handler: controller.registerController,
  });

  fastify.post('/auth/verify-email', {
    handler: controller.verifyEmailController,
  });

  fastify.post('/auth/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes',
      },
    },
    handler: controller.loginController,
  });

  fastify.post('/auth/refresh', {
    handler: controller.refreshController,
  });

  fastify.post('/auth/logout', {
    handler: controller.logoutController,
  });

  fastify.post('/auth/password-reset/request', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 hour',
      },
    },
    handler: controller.requestPasswordResetController,
  });

  fastify.post('/auth/password-reset/confirm', {
    handler: controller.confirmPasswordResetController,
  });
};

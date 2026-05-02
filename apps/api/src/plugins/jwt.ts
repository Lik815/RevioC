import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import type { FastifyInstance } from 'fastify';
import { getEnv } from '../env.js';

export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export default fp(async (fastify: FastifyInstance) => {
  const secret = getEnv().JWT_SECRET;

  fastify.decorate('jwtSign', (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '15m' });
  });

  fastify.decorate('jwtVerify', (token: string): JwtPayload => {
    return jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    jwtSign: (payload: Omit<JwtPayload, 'iat' | 'exp'>) => string;
    jwtVerify: (token: string) => JwtPayload;
  }
}

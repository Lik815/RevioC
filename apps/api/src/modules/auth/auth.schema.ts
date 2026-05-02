import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['patient', 'therapist']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const verifyEmailBodySchema = z.object({
  token: z.string().min(1),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordResetRequestBodySchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmBodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

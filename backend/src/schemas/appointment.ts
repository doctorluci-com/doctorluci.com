import { z } from 'zod';

export const AppointmentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120, 'Name must not exceed 120 characters'),
  phone: z.string().trim().min(5, 'Phone number must be at least 5 characters').max(30, 'Phone number must not exceed 30 characters'),
  email: z.string().trim().email('Invalid email address').max(160, 'Email must not exceed 160 characters'),
  message: z.string().trim().max(2000, 'Message must not exceed 2000 characters').optional().nullable(),
  slot: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time slot format. Must be HH:mm'),
  preferredDate: z.string().optional().nullable(),
});

export type AppointmentInput = z.infer<typeof AppointmentSchema>;

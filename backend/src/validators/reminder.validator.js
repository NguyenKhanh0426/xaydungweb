import { z } from 'zod';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const reminderSchema = z.object({
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  daysOfWeek: z.array(z.enum(weekdays)).min(1).max(7),
  channel: z.enum(['email', 'in_app']).default('in_app'),
  isEnabled: z.boolean().default(true),
  message: z.string().max(255).nullable().optional().transform((value) => value || null)
});

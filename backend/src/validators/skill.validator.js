import { z } from 'zod';

export const skillLogSchema = z.object({
  skillType: z.enum(['listening', 'speaking', 'reading', 'writing']),
  title: z.string().min(2).max(150),
  description: z.string().max(1000).nullable().optional().transform((value) => value || null),
  studyMinutes: z.coerce.number().int().min(0).max(600).default(0),
  score: z.coerce.number().min(0).max(100).nullable().optional(),
  studiedAt: z.string().min(1)
});

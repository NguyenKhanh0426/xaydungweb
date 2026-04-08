import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120),
  englishLevel: z.enum(['beginner','elementary','intermediate','upper_intermediate','advanced']).or(z.literal('')).optional(),
  targetExam: z.enum(['IELTS','TOEIC','COMMUNICATION','OTHER']).or(z.literal('')).optional(),
  bio: z.string().max(1000).optional().default('')
});

export const createGoalSchema = z.object({
  goalType: z.enum(['IELTS','TOEIC','COMMUNICATION','VOCABULARY','GRAMMAR','CUSTOM']),
  targetValue: z.coerce.number().positive().nullable().optional(),
  targetUnit: z.string().max(50).nullable().optional(),
  startDate: z.string().min(1),
  targetDate: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional()
});

import { z } from 'zod';

export const generateMiniTestSchema = z.object({
  setId: z.coerce.number().int().positive(),
  totalQuestions: z.coerce.number().int().min(4).max(10).default(5)
});

export const submitMiniTestSchema = z.object({
  timeSpentSeconds: z.coerce.number().int().min(0).default(0),
  answers: z.array(z.object({
    questionId: z.coerce.number().int().positive(),
    selectedOptionId: z.coerce.number().int().positive().nullable().optional()
  })).min(1)
});

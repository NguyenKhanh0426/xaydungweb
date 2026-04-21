import { z } from 'zod';

export const reviewFlashcardSchema = z.object({
  grade: z.enum(['again', 'hard', 'good', 'easy']),
  responseTimeMs: z.number().int().positive().optional()
});

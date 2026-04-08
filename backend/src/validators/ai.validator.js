import { z } from 'zod';

export const assistantSchema = z.object({
  message: z.string().trim().min(2).max(2000),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1).max(2000)
    })
  ).max(12).optional().default([])
});

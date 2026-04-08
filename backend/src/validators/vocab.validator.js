import { z } from 'zod';

export const createSetSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().max(100).nullable().optional()
});

export const addVocabularySchema = z.object({
  word: z.string().min(1).max(120),
  phonetic: z.string().max(120).nullable().optional(),
  partOfSpeech: z.string().max(50).nullable().optional(),
  meaningVi: z.string().min(1),
  meaningEn: z.string().nullable().optional(),
  exampleSentence: z.string().nullable().optional()
});

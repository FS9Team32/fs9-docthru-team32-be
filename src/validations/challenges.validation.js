import { z } from 'zod';
import { applicationsValidation } from './applications.validation.js';

export const challengesPatchValidation = applicationsValidation.partial();
export const challengesQueryValidation = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
  status: z.enum(['RECRUITING', 'FILLED', 'CLOSED']).optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  orderby: z.string().optional(),
  keyword: z.string().optional(),
});

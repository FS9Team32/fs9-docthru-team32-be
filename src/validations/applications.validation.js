import { z } from 'zod';

export const applicationsValidation = z.object({
  title: z
    .string({
      required_error: 'title is required',
    })
    .min(1, 'title cannot be empty'),

  category: z
    .string({
      required_error: 'category is required',
    })
    .min(1, 'category cannot be empty'),

  documentType: z
    .string({
      required_error: 'documentType is required',
    })
    .min(1, 'documentType cannot be empty'),

  originalLink: z
    .string()
    .url('originalLink must be a valid URL')
    .optional()
    .or(z.literal('')),

  description: z.string().optional(),

  maxParticipants: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((num) => !isNaN(num) && num >= 1, {
      message: 'maxParticipants must be a positive number',
    }),

  deadlineAt: z
    .string()
    .datetime({ message: 'deadlineAt must be a valid datetime string' })
    .optional()
    .nullable(),
});

export const applicationsPatchValidation = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DELETED']).optional(),
  adminFeedback: z.string().max(1000).optional(),
});
export const applicationsQueryValidation = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).default(10).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  orderby: z.string().optional(),
  keyword: z.string().optional(),
});

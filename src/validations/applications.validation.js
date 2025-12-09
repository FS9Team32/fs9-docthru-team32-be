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
export const applicationsPatchValidation = applicationsValidation.partial();

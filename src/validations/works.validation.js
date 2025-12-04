import { z } from 'zod';

export const createWorksValidation = z.object({
  content: z.string().min(1, '게시글 내용은 비어 있을 수 없습니다.'),
});

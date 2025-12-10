import { z } from 'zod';

export const commentsValidation = z.object({
  content: z.string().min(1, '댓글 내용은 비어 있을 수 없습니다.'),
});

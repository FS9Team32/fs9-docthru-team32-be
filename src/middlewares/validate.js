import { z } from 'zod';
import { BadRequestException } from '../err/badRequestException.js';

/**
 * @param {z.ZodSchema<any>} schema 검사할 Zod 스키마
 * @param {'body' | 'query' | 'params'} type 검사할 요청 데이터의 위치
 * @returns {Function} Express 미들웨어 함수
 */
export const validate =
  (schema, type = 'body') =>
  async (req, res, next) => {
    try {
      const dataToValidate = req[type] || {};
      await schema.parseAsync(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          location: type,
        }));
        next(new BadRequestException('유효성 검사 실패', formattedErrors));
      } else {
        // 다른 오류는 다음 오류 핸들러로 전달한다.
        next(error);
      }
    }
  };

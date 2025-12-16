import { HttpException } from '../err/httpException.js';

export const errorHandler = (error, req, res, _next) => {
  console.error('Error Message', error);

  if (error instanceof HttpException) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).send('유효하지 않은 토큰입니다.');
  }

  return res.status(500).json({
    success: false,
    message: '서버에러',
  });
};

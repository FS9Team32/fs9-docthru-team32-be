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
    res.status(401).send('Invalid Token');
  }

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

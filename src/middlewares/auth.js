import { expressjwt } from 'express-jwt';
import { config } from '../config/config.js';

const verifyAccessToken = expressjwt({
  secret: config.JWT_SECRET,
  algorithms: ['HS256'],
});

const verifyRefreshToken = expressjwt({
  secret: config.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.refreshToken,
});

function validateEmailAndPassword(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error('email, password 가 모두 필요합니다.');
    error.code = 422;
    throw error;
  }
  next();
}
export default {
  verifyAccessToken,
  verifyRefreshToken,
  validateEmailAndPassword,
};

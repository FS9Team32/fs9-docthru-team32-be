import { expressjwt } from 'express-jwt';
import { config } from '../config/config.js';
import { ForbiddenException } from '../err/forbiddenException.js';

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
    const error = new Error('All Inputs Are Required');
    error.statusCode = 422;
    throw error;
  }
  next();
}

function requireAdmin(req, res, next) {
  const { role } = req.auth;

  if (role !== 'ADMIN') {
    throw new ForbiddenException('관리자 권한이 필요합니다.');
  }

  next();
}

function forbidAdmin(req, res, next) {
  const { role } = req.auth;

  if (role === 'ADMIN') {
    throw new ForbiddenException('관리자는 해당 동작을 수행할 수 없습니다.');
  }

  next();
}

export default {
  verifyAccessToken,
  verifyRefreshToken,
  validateEmailAndPassword,
  requireAdmin,
  forbidAdmin,
};

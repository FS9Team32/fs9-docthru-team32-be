import bcrypt from 'bcrypt';
import authRepo from '../repos/auth.repo.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { ConflictException } from '../err/conflictException.js';
import { UnauthorizedException } from '../err/unauthorizedException.js';

async function createUser(user) {
  const existedUser = await authRepo.findByEmail(user.email);
  if (existedUser) {
    throw new ConflictException('이미 존재하는 이메일입니다.');
  }
  const hashedPassword = await hashPassword(user.password);
  const createdUser = await authRepo.save({
    ...user,
    password: hashedPassword,
  });
  return filterSensitiveUserData(createdUser);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function filterSensitiveUserData(user) {
  const { password: _password, refreshToken: _refreshToken, ...rest } = user;
  return rest;
}

async function getUser(email, password) {
  const user = await authRepo.findByEmail(email);
  if (!user) {
    throw new ConflictException('존자하지 않는 이메일입니다.');
  }
  await verifyPassword(password, user.password);
  return filterSensitiveUserData(user);
}

async function verifyPassword(inputPassword, password) {
  const isMatch = await bcrypt.compare(inputPassword, password);
  if (!isMatch) {
    throw new UnauthorizedException('비밀번호가 틀렸습니다.');
  }
}

function createToken(user, type) {
  const payload = { userId: user.id, role: user.role };
  const secret =
    type === 'refresh' ? config.JWT_REFRESH_SECRET : config.JWT_SECRET;
  const expiresIn = type === 'refresh' ? '2w' : '1h';
  return jwt.sign(payload, secret, { expiresIn });
}

async function updateUser(id, data) {
  const updatedUser = await authRepo.update(id, data);
  return filterSensitiveUserData(updatedUser);
}

async function refreshToken(userId, refreshToken) {
  const user = await authRepo.findById(userId);
  if (!user || !user.refreshToken) {
    throw new UnauthorizedException('권한이 필요합니다.');
  }
  if (user.refreshToken !== refreshToken) {
    throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
  }

  const newAccessToken = createToken(user);
  const newRefreshToken = createToken(user, 'refresh');
  await authRepo.update(user.id, { refreshToken: newRefreshToken });
  return { newAccessToken, newRefreshToken };
}

export default {
  createUser,
  getUser,
  updateUser,
  createToken,
  refreshToken,
};

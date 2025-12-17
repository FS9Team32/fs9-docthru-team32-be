import bcrypt from 'bcrypt';
import authRepo from '../repos/auth.repo.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { ConflictException } from '../err/conflictException.js';
import { UnauthorizedException } from '../err/unauthorizedException.js';
import { NotFoundException } from '../err/notFoundException.js';
import { worksRepo } from '../repos/works.repo.js';
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
    throw new ConflictException('존재하지 않는 이메일입니다.');
  }
  await verifyPassword(password, user.password);
  await evaluateAndUpdateUserRole(user.id);
  const updatedUser = await authRepo.findById(user.id);
  return filterSensitiveUserData(updatedUser);
}

async function getUserById(id) {
  const user = await authRepo.findById(id);
  if (!user) {
    throw new NotFoundException('존재하지 않는 유저입니다.');
  }
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

async function evaluateAndUpdateUserRole(userId) {
  const [participationCount, selectedCount] = await Promise.all([
    worksRepo.countWorksByWorkerId(userId),
    worksRepo.findSelectedWorksCountByWorkerId(userId),
  ]);

  const isPro =
    (participationCount >= 5 && selectedCount >= 5) ||
    participationCount >= 10 ||
    selectedCount >= 10;
  const user = await authRepo.findById(userId);

  // 어드민은 등급 평가 대상에서 제외
  if (user.role === 'ADMIN') {
    return {
      role: user.role,
      participationCount: 0,
      selectedCount: 0,
    };
  }

  const newRole = isPro ? 'PRO' : 'NORMAL';

  await authRepo.update(userId, { role: newRole });

  return {
    role: newRole,
    participationCount,
    selectedCount,
  };
}

export default {
  createUser,
  getUser,
  getUserById,
  updateUser,
  createToken,
  refreshToken,
  evaluateAndUpdateUserRole,
};

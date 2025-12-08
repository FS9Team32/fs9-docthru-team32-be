import bcrypt from 'bcrypt';
import authRepo from '../repository/auth.repo.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { ConflictException } from '../err/conflictException.js';
import { UnauthorizedException } from '../err/unauthorizedException.js';

async function createUser(user) {
  try {
    const existedUser = await authRepo.findByEmail(user.email);
    if (existedUser) {
      throw new ConflictException('Email Already Exists');
    }
    const hashedPassword = await hashPassword(user.password);
    const createdUser = await authRepo.save({
      ...user,
      password: hashedPassword,
    });
    return filterSensitiveUserData(createdUser);
  } catch (error) {
    if (error.statusCode === 409) throw error;
    const customError = new Error('DB Error Accured');
    customError.code = 500;
    throw customError;
  }
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function filterSensitiveUserData(user) {
  const { password: _password, refreshToken: _refreshToken, ...rest } = user;
  return rest;
}

async function getUser(email, password) {
  try {
    const user = await authRepo.findByEmail(email);
    if (!user) {
      throw new ConflictException('Email Does Not Exists');
    }
    await verifyPassword(password, user.password);
    return filterSensitiveUserData(user);
  } catch (error) {
    if (error.statusCode === 401) throw error;
    const customError = new Error('DB Error Accured');
    customError.code = 500;
    throw customError;
  }
}

async function verifyPassword(inputPassword, password) {
  const isMatch = await bcrypt.compare(inputPassword, password);
  if (!isMatch) {
    throw new UnauthorizedException('Incorrect Password');
  }
}

function createToken(user, type) {
  const payload = { userId: user.id };
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: type === 'refresh' ? '2w' : '1h',
  });
  return token;
}

async function updateUser(id, data) {
  const updatedUser = await authRepo.update(id, data);
  return filterSensitiveUserData(updatedUser);
}

async function refreshToken(userId, refreshToken) {
  const user = await authRepo.findById(userId);
  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedException('Unauthorized Error');
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

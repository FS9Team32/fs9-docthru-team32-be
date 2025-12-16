import express from 'express';
import authServices from '../services/auth.services.js';
import auth from '../middlewares/auth.js';
import { BadRequestException } from '../err/badRequestException.js';
import { validate } from '../middlewares/validate.js';
import {
  signupValidation,
  loginValidation,
} from '../validations/auth.validation.js';
const authRouter = express.Router();

authRouter.post(
  '/signup',
  validate(signupValidation, 'body'),
  async (req, res, next) => {
    try {
      const { email, nickname, password } = req.body;

      const user = await authServices.createUser({ email, nickname, password });
      const accessToken = authServices.createToken(user);
      const refreshToken = authServices.createToken(user, 'refresh');

      await authServices.updateUser(user.id, { refreshToken });
      res.status(201).json({
        success: true,
        ...user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  '/login',
  validate(loginValidation, 'body'),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await authServices.getUser(email, password);
      const accessToken = authServices.createToken(user);
      const refreshToken = authServices.createToken(user, 'refresh');

      await authServices.updateUser(user.id, { refreshToken });

      res.json({
        success: true,
        ...user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post('/logout', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;

    await authServices.updateUser(userId, { refreshToken: null });

    res.status(200).json({ success: true, message: '로그아웃 성공' });
  } catch (error) {
    next(error);
  }
});

authRouter.post(
  '/token/refresh',
  auth.verifyRefreshToken,
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new BadRequestException('리프레시 토큰이 필요합니다.');
      }

      const { newAccessToken, newRefreshToken } =
        await authServices.refreshToken(userId, refreshToken);

      return res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default authRouter;

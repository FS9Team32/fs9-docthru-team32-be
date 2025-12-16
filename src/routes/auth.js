import express from 'express';
import authService from '../services/auth.service.js';
import auth from '../middlewares/auth.js';
import { BadRequestException } from '../err/badRequestException.js';
const authRouter = express.Router();

authRouter.post('/signup', async (req, res, next) => {
  try {
    const { email, nickname, password } = req.body;
    if (!email || !nickname || !password) {
      throw new BadRequestException('All Inputs Are Required');
    }

    const user = await authService.createUser({ email, nickname, password });
    const accessToken = authService.createToken(user);
    const refreshToken = authService.createToken(user, 'refresh');

    await authService.updateUser(user.id, { refreshToken });
    res.status(201).json({
      ...user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestException('Email and Password is Required');
    }

    const user = await authService.getUser(email, password);
    const accessToken = authService.createToken(user);
    const refreshToken = authService.createToken(user, 'refresh');

    await authService.updateUser(user.id, { refreshToken });

    res.json({
      ...user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;

    await authService.updateUser(userId, { refreshToken: null });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
});

export default authRouter;

authRouter.post(
  '/token/refresh',
  auth.verifyRefreshToken,
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new BadRequestException('RefreshToken is required');
      }

      const { newAccessToken, newRefreshToken } =
        await authService.refreshToken(userId, refreshToken);

      return res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

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
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
    res.status(201).json({ ...user, accessToken });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new BadRequestException('Email and Password is Required');
    }
    const user = await authService.getUser(email, password);
    const refreshToken = authService.createToken(user, 'refresh');
    const accessToken = authService.createToken(user);
    await authService.updateUser(user.id, { refreshToken });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
    res.json({ ...user, accessToken });
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
      const refreshToken = req.cookies.refreshToken;
      const { newAccessToken, newRefreshToken } =
        await authService.refreshToken(userId, refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/token/refresh',
      });
      return res.json({ accessToken: newAccessToken });
    } catch (error) {
      return next(error);
    }
  },
);

export default authRouter;

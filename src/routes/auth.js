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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - nickname
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일
 *               nickname:
 *                 type: string
 *                 description: 닉네임
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호 (최소 6자)
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 nickname:
 *                   type: string
 *                 role:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       409:
 *         description: 이미 존재하는 이메일
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 nickname:
 *                   type: string
 *                 role:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '로그아웃 성공'
 *       401:
 *         description: 인증 실패
 */
authRouter.post('/logout', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;

    await authServices.updateUser(userId, { refreshToken: null });

    res.status(200).json({ success: true, message: '로그아웃 성공' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/token/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 리프레시 토큰
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 유효하지 않은 토큰
 */
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

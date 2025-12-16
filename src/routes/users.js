import express from 'express';
import auth from '../middlewares/auth.js';
import authServices from '../services/auth.services.js';
import applicationsServices from '../services/applications.services.js';
import challengesServices from '../services/challenges.services.js';
import { validate } from '../middlewares/validate.js';
import { applicationsQueryValidation } from '../validations/applications.validation.js';
import { challengesQueryValidation } from '../validations/challenges.validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관련 API
 */

router.get('/me', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const data = await authServices.getUserById(userId);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /user/me/challenge-applications:
 *   get:
 *     summary: 내 챌린지 신청 목록 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get(
  '/me/challenge-applications',
  auth.verifyAccessToken,
  validate(applicationsQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const query = req.query;

      const data = await applicationsServices.getApplicationsListForUser({
        userId,
        query,
      });

      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /user/me/challenge:
 *   get:
 *     summary: 내 챌린지 목록 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *       - in: query
 *         name: progress
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get(
  '/me/challenge',
  auth.verifyAccessToken,
  validate(challengesQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const { userId, role } = req.auth;
      const query = req.query;
      const data = await challengesServices.getChallengesListForUser({
        query,
        userId,
        role,
      });
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);
export default router;

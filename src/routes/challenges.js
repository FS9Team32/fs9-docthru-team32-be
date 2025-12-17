import express from 'express';
import auth from '../middlewares/auth.js';
import {
  challengesPatchValidation,
  challengesQueryValidation,
} from '../validations/challenges.validation.js';
import challengesServices from '../services/challenges.services.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: 챌린지 관리 API
 */

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: 챌린지 생성 (관리자)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: 승인된 신청서 ID
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: 권한 없음
 */
router.post(
  '/',
  auth.verifyAccessToken,
  auth.requireAdmin,
  async (req, res, next) => {
    try {
      const { applicationId } = req.body;

      const result = await challengesServices.createChallenge({
        applicationId,
      });
      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: 챌린지 목록 조회
 *     tags: [Challenges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 당 항목 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECRUITING, FILLED, CLOSED]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderby
 *         schema:
 *           type: string
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get(
  '/',
  validate(challengesQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const query = req.query;
      const data = await challengesServices.getChallengesList({
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
 * /challenges/{challengeId}:
 *   get:
 *     summary: 챌린지 상세 조회
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get('/:challengeId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.auth;

    const challenge = await challengesServices.getChallengeById({
      challengeId: Number(challengeId),
      userId,
    });
    res.status(200).json({
      success: true,
      ...challenge,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /challenges/{challengeId}:
 *   patch:
 *     summary: 챌린지 수정 (관리자)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               field:
 *                 type: string
 *               docUrl:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 수정 성공
 *       403:
 *         description: 권한 없음
 */
router.patch(
  '/:challengeId',
  auth.verifyAccessToken,
  auth.requireAdmin,
  validate(challengesPatchValidation, 'body'),
  async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const data = req.body;

      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key],
      );
      const updated = await challengesServices.updatechallenge({
        challengeId: Number(challengeId),
        data,
      });
      res.status(200).json({
        success: true,
        challenge: updated,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /challenges/{challengeId}:
 *   delete:
 *     summary: 챌린지 삭제 (관리자)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminFeedback
 *             properties:
 *               adminFeedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       403:
 *         description: 권한 없음
 */
router.delete(
  '/:challengeId',
  auth.verifyAccessToken,
  auth.requireAdmin,
  async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const { adminFeedback } = req.body; // admin 삭제 사유

      await challengesServices.deleteChallenge({
        challengeId: Number(challengeId),
        adminFeedback,
      });

      res.status(200).json({
        success: true,
        message: 'challenge deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

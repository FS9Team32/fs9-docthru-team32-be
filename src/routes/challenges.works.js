import express from 'express';
import worksServices from '../services/works.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { worksValidation } from '../validations/works.validation.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Works
 *   description: 번역 챌린지 참여 작업물 API
 */

/**
 * @swagger
 * /challenges/{challengeId}/works:
 *   post:
 *     summary: 챌린지 작업물 생성
 *     tags: [Works]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 작업물 내용
 *     responses:
 *       201:
 *         description: 작업물 생성 성공
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
 *                 content:
 *                   type: string
 *                 workerId:
 *                   type: integer
 *                 challengeId:
 *                   type: integer
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (관리자 접근 불가)
 */
router.post(
  '/',
  auth.verifyAccessToken,
  auth.forbidAdmin,
  validate(worksValidation, 'body'),
  async (req, res, next) => {
    try {
      const { userId: workerId } = req.auth;
      const { challengeId } = req.params;
      const { content } = req.body;
      const newWorkData = await worksServices.createWork({
        challengeId: Number(challengeId),
        workerId: Number(workerId),
        content,
      });

      res.status(201).json({
        success: true,
        ...newWorkData,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /challenges/{challengeId}/works:
 *   get:
 *     summary: 챌린지 작업물 목록 조회
 *     tags: [Works]
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 당 항목 수
 *     responses:
 *       200:
 *         description: 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalCount:
 *                   type: integer
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       workerId:
 *                         type: integer
 *                       worker:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: integer
 *                            nickname:
 *                              type: string
 *                            role:
 *                              type: string
 *       400:
 *         description: 잘못된 요청
 */
router.get('/', async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const { page, limit, selected } = req.query;

    const { totalCount, rankedList } =
      await worksServices.getChallengeWorksList(Number(challengeId), {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        selected: selected ? true : undefined,
      });

    res.status(200).json({
      success: true,
      totalCount,
      list: rankedList,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import worksServices from '../services/works.services.js'; // .js 확장자 주의
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { worksValidation } from '../validations/works.validation.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /works/{workId}:
 *   get:
 *     summary: 챌린지 작업물 상세 조회
 *     tags: [Works]
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *     responses:
 *       200:
 *         description: 상세 조회 성공
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
 *                 userId:
 *                   type: integer
 *                 challengeId:
 *                   type: integer
 *                 createdAt:
 *                   format: date-time
 *                 updatedAt:
 *                   format: date-time
 *                 editedAt:
 *                   format: date-time
 *                 worker:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nickname:
 *                       type: string
 *                     role:
 *                        type: string
 *       400:
 *         description: 잘못된 요청
 */
// 상세 조회
router.get('/:workId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { userId } = req.auth;

    const work = await worksServices.getWork({
      workId: Number(workId),
      userId,
    });

    res.status(200).json({
      success: true,
      ...work,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /works/{workId}:
 *   patch:
 *     summary: 챌린지 작업물 수정
 *     tags: [Works]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
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
 *                 description: 수정할 작업물 내용
 *     responses:
 *       200:
 *         description: 수정 성공
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
 *         description: 권한 없음
 */
// 수정
router.patch(
  '/:workId',
  auth.verifyAccessToken,
  validate(worksValidation, 'body'),
  async (req, res, next) => {
    try {
      const { workId } = req.params;
      const { content } = req.body;
      const { userId, role } = req.auth; // 현재 로그인한 유저 ID

      const updatedWork = await worksServices.updateWork({
        workId: Number(workId),
        userId: Number(userId),
        role,
        content,
      });

      res.status(200).json({
        success: true,
        ...updatedWork,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /works/{workId}:
 *   delete:
 *     summary: 챌린지 작업물 삭제
 *     tags: [Works]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
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
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
// 삭제
router.delete('/:workId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { userId, role } = req.auth;
    const deletedWork = await worksServices.deleteWork({
      workId: Number(workId),
      userId: Number(userId),
      role,
    });

    res.status(200).json({
      success: true,
      ...deletedWork,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import likesServices from '../services/likes.services.js';
import auth from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: 작업물 좋아요 API
 */

/**
 * @swagger
 * /works/{workId}/likes:
 *   post:
 *     summary: 좋아요 생성
 *     tags: [Likes]
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
 *       201:
 *         description: 좋아요 생성 성공
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
 *                   example: '좋아요가 추가되었습니다.'
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
  async (req, res, next) => {
    try {
      const { workId } = req.params;
      const { userId } = req.auth;

      await likesServices.createLike({
        workId: Number(workId),
        userId: Number(userId),
      });
      res
        .status(201)
        .json({ success: true, message: '좋아요가 추가되었습니다.' });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /works/{workId}/likes:
 *   delete:
 *     summary: 좋아요 취소
 *     tags: [Likes]
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
 *         description: 좋아요 취소 성공
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
 *                   example: '좋아요가 취소되었습니다.'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (관리자 접근 불가)
 */
router.delete(
  '/',
  auth.verifyAccessToken,
  auth.forbidAdmin,
  async (req, res, next) => {
    try {
      const { workId } = req.params;
      const { userId } = req.auth;

      await likesServices.deleteLike({
        workId: Number(workId),
        userId: Number(userId),
      });
      res
        .status(200)
        .json({ success: true, message: '좋아요가 취소되었습니다.' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

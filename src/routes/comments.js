import express from 'express';
import commentsServices from '../services/comments.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { commentsValidation } from '../validations/comments.validation.js';

const router = express.Router();

/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     summary: 댓글 수정
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글 ID
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
 *                 description: 수정할 댓글 내용
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
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
 *                 authorId:
 *                         type: integer
 *                       author:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                           role:
 *                             type: string
 *                 workId:
 *                   type: integer
 *                 createdAt:
 *                   format: date-time
 *                 updatedAt:
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.patch(
  '/:commentId',
  auth.verifyAccessToken,
  validate(commentsValidation, 'body'),
  async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { userId, role } = req.auth;
      const { content } = req.body;
      const updatedComment = await commentsServices.updateComment({
        commentId: Number(commentId),
        userId,
        role,
        content,
      });
      res.status(200).json({
        success: true,
        ...updatedComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
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
router.delete('/:commentId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { userId, role } = req.auth;
    const deletedComment = await commentsServices.deleteComment({
      commentId: Number(commentId),
      userId,
      role,
    });
    res.status(200).json({
      success: true,
      ...deletedComment,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

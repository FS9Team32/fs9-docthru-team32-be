import express from 'express';
import commentsServices from '../services/comments.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { commentsValidation } from '../validations/comments.validation.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: 작업물 댓글 API
 */

/**
 * @swagger
 * /works/{workId}/comments:
 *   post:
 *     summary: 댓글 생성
 *     tags: [Comments]
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
 *                 description: 댓글 내용
 *     responses:
 *       201:
 *         description: 댓글 생성 성공
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
 *                   type: integer
 *                 workId:
 *                   type: integer
 *                 createdAt:
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/',
  auth.verifyAccessToken,
  validate(commentsValidation, 'body'),
  async (req, res, next) => {
    try {
      const { workId } = req.params;
      const { userId } = req.auth;
      const { content } = req.body;
      const newComment = await commentsServices.createComment({
        workId: Number(workId),
        userId,
        content,
      });
      res.status(201).json({
        success: true,
        ...newComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /works/{workId}/comments:
 *   get:
 *     summary: 댓글 목록 조회
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 가져올 항목 수
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: 커서 ID (마지막 댓글 ID)
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
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       authorId:
 *                         type: integer
 *                       author:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                           role:
 *                             type: string
 *                       createdAt:
 *                         format: date-time
 *                       updatedAt:
 *                         format: date-time
 *       400:
 *         description: 잘못된 요청
 */
router.get('/', async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { limit, cursor } = req.query;
    const getListParams = {
      workId: Number(workId),
      limit: Number(limit),
    };
    if (cursor) {
      getListParams.cursorId = Number(cursor);
    }
    const commentList =
      await commentsServices.getWorkCommentsList(getListParams);
    res.status(200).json({
      success: true,
      ...commentList,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

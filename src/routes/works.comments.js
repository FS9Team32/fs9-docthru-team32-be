import express from 'express';
import commentsServices from '../services/comments.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { commentsValidation } from '../validations/comments.validation.js';

const router = express.Router({ mergeParams: true });

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

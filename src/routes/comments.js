import express from 'express';
import commentsServices from '../services/comments.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { commentsValidation } from '../validations/comments.validation.js';

const router = express.Router();

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

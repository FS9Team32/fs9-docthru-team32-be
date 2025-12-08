import express from 'express';
import commentsServices from '../services/comments.services.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.patch('/:commentId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.auth;
    const { content } = req.body;
    const updatedComment = await commentsServices.updateComment({
      commentId: Number(commentId),
      userId,
      content,
    });
    res.status(200).json({
      success: true,
      ...updatedComment,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:commentId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.auth;
    const deletedComment = await commentsServices.deleteComment({
      commentId: Number(commentId),
      userId,
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

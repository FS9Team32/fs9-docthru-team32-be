import express from 'express';
import likeServices from '../services/like.services.js';
import auth from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });
//TODO. 유저 role이 ADMIN이면 거부
router.post('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { userId } = req.auth;
    await likeServices.createLike({
      workId: Number(workId),
      userId: Number(userId),
    });
    res
      .status(201)
      .json({ success: true, message: '좋아요가 추가되었습니다.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { userId } = req.auth;
    await likeServices.deleteLike({
      workId: Number(workId),
      userId: Number(userId),
    });
    res
      .status(200)
      .json({ success: true, message: '좋아요가 취소되었습니다.' });
  } catch (err) {
    next(err);
  }
});

export default router;

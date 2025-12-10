import express from 'express';
import likeServices from '../services/like.services.js';
import auth from '../middlewares/auth.js';
import { ForbiddenException } from '../err/forbiddenException.js'; // Assuming this custom error class exists or will be created

const router = express.Router({ mergeParams: true });
router.post('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { userId, role } = req.auth;

    if (role === 'ADMIN') {
      throw new ForbiddenException(
        '관리자는 작업물에 좋아요 반응을 남길 수 없습니다.',
      );
    }

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
    const { userId, role } = req.auth;

    if (role === 'ADMIN') {
      throw new ForbiddenException(
        '관리자는 작업물에 좋아요 반응을 남길 수 없습니다.',
      );
    }

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

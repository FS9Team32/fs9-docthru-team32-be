import express from 'express';
import worksServices from '../services/works.services.js'; // .js 확장자 주의
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { worksValidation } from '../validations/works.validation.js';

const router = express.Router({ mergeParams: true });

// 상세 조회
router.get('/:workId', async (req, res, next) => {
  try {
    const { workId } = req.params;

    const work = await worksServices.getWork(Number(workId));

    res.status(200).json({
      success: true,
      ...work,
    });
  } catch (err) {
    next(err);
  }
});

// 수정
router.patch(
  '/:workId',
  auth.verifyAccessToken, // 로그인 필요
  validate(worksValidation, 'body'),
  async (req, res, next) => {
    try {
      const { workId } = req.params;
      const { content } = req.body;
      const { userId } = req.auth; // 현재 로그인한 유저 ID

      const updatedWork = await worksServices.updateWork({
        worksId: Number(workId),
        userId: Number(userId),
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

// 삭제
router.delete(
  '/:workId',
  auth.verifyAccessToken, // 로그인 필요
  async (req, res, next) => {
    try {
      const { workId } = req.params;
      const { userId } = req.auth;
      const deletedWork = await worksServices.deleteWork({
        workId: Number(workId),
        userId: Number(userId),
      });

      res.status(200).json({
        success: true,
        ...deletedWork,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

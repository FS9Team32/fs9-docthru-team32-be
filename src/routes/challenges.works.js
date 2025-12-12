import express from 'express';
import worksServices from '../services/works.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { worksValidation } from '../validations/works.validation.js';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  auth.verifyAccessToken,
  auth.forbidAdmin,
  validate(worksValidation, 'body'),
  async (req, res, next) => {
    try {
      const { userId: workerId } = req.auth;
      const { challengeId } = req.params;
      const { content } = req.body;
      const newWorkData = await worksServices.createWork({
        challengeId: Number(challengeId),
        workerId: Number(workerId),
        content,
      });

      res.status(201).json({
        success: true,
        ...newWorkData,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/', async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const { page, limit } = req.query;

    const { totalCount, rankedList } =
      await worksServices.getChallengeWorksList(Number(challengeId), {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

    res.status(200).json({
      success: true,
      totalCount,
      list: rankedList,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

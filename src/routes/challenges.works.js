import express from 'express';
import worksServices from '../services/works.services.js';
import auth from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { worksValidation } from '../validations/works.validation.js';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  auth.verifyAccessToken,
  validate(worksValidation, 'body'),
  async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const { userId: workerId } = req.auth;
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
    const { totalCount, rankedList: list } =
      await worksServices.getChallengeWorksList(challengeId);
    return { totalCount, list };
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import auth from '../middlewares/auth.js';
import {
  challengesPatchValidation,
  challengesQueryValidation,
} from '../validations/challenges.validation.js';
import challengeService from '../services/challenges.services.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post(
  '/',
  auth.verifyAccessToken,
  auth.requireAdmin,
  async (req, res, next) => {
    try {
      const { applicationId } = req.body;

      const result = await challengeService.createChallenge({ applicationId });
      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  validate(challengesQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const query = req.query;
      const data = await challengeService.getChallengesList({
        query,
      });

      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/:challengeId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.auth;

    const challenge = await challengeService.getChallengeById({
      challengeId: Number(challengeId),
      userId,
    });
    res.status(200).json({
      success: true,
      ...challenge,
    });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:challengeId',
  auth.verifyAccessToken,
  auth.requireAdmin,
  validate(challengesPatchValidation, 'body'),
  async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const data = req.body;

      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key],
      );
      const updated = await challengeService.updatechallenge({
        challengeId: Number(challengeId),
        data,
      });
      res.status(200).json({
        success: true,
        challenge: updated,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:challengeId',
  auth.verifyAccessToken,
  auth.requireAdmin,
  async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const { adminFeedback } = req.body; // admin 삭제 사유

      await challengeService.deleteChallenge({
        challengeId: Number(challengeId),
        adminFeedback,
      });

      res.status(200).json({
        success: true,
        message: 'challenge deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

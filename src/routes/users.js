import express from 'express';
import auth from '../middlewares/auth.js';
import { applicationsQueryValidation } from '../validations/applications.validation.js';
import applicationService from '../services/application.service.js';
import { validate } from '../middlewares/validate.js';
import { challengesQueryValidation } from '../validations/challenges.validation.js';
import challengeService from '../services/challenge.service.js';

const router = express.Router();
router.get(
  '/me/challenge-applications',
  auth.verifyAccessToken,
  validate(applicationsQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const query = req.query;

      const data = await applicationService.getApplicationsListForUser({
        userId,
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

router.get(
  '/me/challenge',
  auth.verifyAccessToken,
  validate(challengesQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const { userId, role } = req.auth;
      const query = req.query;
      const data = await challengeService.getChallengesListForUser({
        query,
        userId,
        role,
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
export default router;

import express from 'express';
import auth from '../middlewares/auth.js';
import authServices from '../services/auth.services.js';
import applicationsServices from '../services/applications.services.js';
import challengesServices from '../services/challenges.services.js';
import { validate } from '../middlewares/validate.js';
import { applicationsQueryValidation } from '../validations/applications.validation.js';
import { challengesQueryValidation } from '../validations/challenges.validation.js';

const router = express.Router();

router.get('/me', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const data = await authServices.getUserById(userId);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/me/challenge-applications',
  auth.verifyAccessToken,
  validate(applicationsQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const query = req.query;

      const data = await applicationsServices.getApplicationsListForUser({
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
      const data = await challengesServices.getChallengesListForUser({
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

// src/routes/applications.routes.js
import express from 'express';
import applicationService from '../services/application.service.js';
import auth from '../middlewares/auth.js';
import {
  applicationsValidation,
  applicationsPatchValidation,
  applicationsQueryValidation,
} from '../validations/applications.validation.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post(
  '/',
  auth.verifyAccessToken,
  validate(applicationsValidation),
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const data = req.body;
      const dto = {
        creatorId: Number(userId),
        ...data,
      };

      const created = await applicationService.createApplication(dto);
      res.status(200).json({
        success: true,
        application: created,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  auth.verifyAccessToken,
  validate(applicationsQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const query = req.query;
      const data = await applicationService.getApplicationsList({
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
  '/:applicationId',
  auth.verifyAccessToken,
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const application = await applicationService.getApplicationById({
        applicationId: Number(applicationId),
      });
      res.status(200).json({
        success: true,
        ...application,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:applicationId',
  auth.verifyAccessToken,
  validate(applicationsPatchValidation, 'body'),
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { userId } = req.auth;
      const data = req.body;

      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key],
      );
      const updated = await applicationService.updateApplication({
        applicationId: Number(applicationId),
        userId: Number(userId),
        data,
      });
      res.status(200).json({
        success: true,
        application: updated,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:applicationId',
  auth.verifyAccessToken,
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { userId } = req.auth;

      await applicationService.deleteApplication({
        applicationId: Number(applicationId),
        userId: Number(userId),
      });

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

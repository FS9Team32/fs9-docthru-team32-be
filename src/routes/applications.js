// src/routes/applications.routes.js
import express from 'express';
import applicationsServices from '../services/applications.services.js';
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

      const created = await applicationsServices.createApplication(dto);
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
  auth.requireAdmin,
  validate(applicationsQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const query = req.query;
      const data = await applicationsServices.getApplicationsListForAdmin({
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
      const application = await applicationsServices.getApplicationById({
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

// PATCH /challenge-application/applicationsId == 상태 수정, 피드백 전달
// 에 관련된 patch (어드민 권한)

router.patch(
  '/:applicationId',
  auth.verifyAccessToken,
  auth.requireAdmin,
  validate(applicationsPatchValidation, 'body'),
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { status, adminFeedback } = req.body;
      const updated = await applicationsServices.updateApplication({
        applicationId: Number(applicationId),
        status,
        adminFeedback,
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

// DELETE /challenge-application/applicationId == 유저가 PENDING시점일시 신청 취소
// 유저 권한
router.delete(
  '/:applicationId',
  auth.verifyAccessToken,
  auth.forbidAdmin,
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { userId } = req.auth;

      await applicationsServices.deleteApplication({
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

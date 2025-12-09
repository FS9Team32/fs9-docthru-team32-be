// src/routes/applications.routes.js
import express from 'express';
import applicationService from '../services/application.service.js';
import auth from '../middlewares/auth.js';
import { applicationsPatchValidation } from '../validations/applications.validation.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const {
      title,
      category,
      documentType,
      originalLink,
      description,
      maxParticipants,
      deadlineAt,
    } = req.body;

    if (!title || !category || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'title, category, documentType are required',
      });
    }

    const dto = {
      creatorId: Number(userId),
      title,
      category,
      documentType,
      originalLink,
      description,
      maxParticipants: maxParticipants ? Number(maxParticipants) : 1,
      deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
    };

    const created = await applicationService.createApplication(dto);
    return res.status(201).json({ success: true, application: created });
  } catch (err) {
    next(err);
  }
});

//GET /challenge-applications/:applicationId

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

      return res.status(200).json({
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
      const { applicationId } = req.params; // URL에서 application ID
      const { userId } = req.auth; // 인증된 userId

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

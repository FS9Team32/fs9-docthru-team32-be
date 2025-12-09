// src/routes/applications.routes.js
import express from 'express';
import applicationService from '../services/application.service.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth; // 또는 req.user.id depending on your auth
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

export default router;

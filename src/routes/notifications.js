import express from 'express';
import notificationsServices from '../services/notifications.services.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

router.get('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const list = await notificationsServices.getNotifications(userId);
    res.status(200).json({
      success: true,
      list,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;

    await notificationsServices.deleteAllNotificationsByUserId(userId);
    res.status(200).json({
      success: true,
      message: '모든 알림을 닫았습니다.',
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:notiId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { notiId } = req.params;
    await notificationsServices.deleteNotificationById({
      notiId,
      userId,
    });
    res.status(200).json({
      success: true,
      message: '알림을 닫았습니다.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;

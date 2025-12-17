import express from 'express';
import notificationsServices from '../services/notifications.services.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: 알림 관련 API
 */

/**
 * @swagger
 * /users/me/notifications:
 *   get:
 *     summary: 내 알림 목록 조회
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 실패
 */
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

/**
 * @swagger
 * /users/me/notifications:
 *   delete:
 *     summary: 내 모든 알림 삭제 (전체 읽음 처리)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '모든 알림을 닫았습니다.'
 *       401:
 *         description: 인증 실패
 */
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

/**
 * @swagger
 * /users/me/notifications/{notiId}:
 *   delete:
 *     summary: 특정 알림 삭제 (읽음 처리)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notiId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '알림을 닫았습니다.'
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 알림을 찾을 수 없음
 */
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

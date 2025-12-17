import { notificationsRepo } from '../repos/notifications.repo.js';
import { isAuthorized } from '../utils/permission.js';
import { NotFoundException } from '../err/notFoundException.js';

async function getNotifications(userId) {
  return notificationsRepo.findNotificationsListByUserId(userId);
}

async function deleteAllNotificationsByUserId(userId) {
  return notificationsRepo.deleteAllNotificationsByUserId(userId);
}

async function deleteNotificationById({ notiId, userId }) {
  const id = Number(notiId);
  const originNoti = notificationsRepo.findNotificationById(id);
  if (!originNoti) {
    throw new NotFoundException('알림을 찾을 수 없습니다.');
  }
  isAuthorized(originNoti.userId, userId);
  return notificationsRepo.deleteNotificationById(id);
}

export default {
  getNotifications,
  deleteAllNotificationsByUserId,
  deleteNotificationById,
};

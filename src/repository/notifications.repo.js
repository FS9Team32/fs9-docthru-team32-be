import { prisma } from '../db/prisma.js';

async function findNotificationsListByUserId(userId, tx) {
  const db = tx || prisma;
  return db.notification.findMany({
    where: { userId: Number(userId) },
  });
}

async function addNotification({ userId, message }, tx) {
  const db = tx || prisma;
  return db.notification.create({
    data: {
      userId,
      message,
    },
  });
}

async function deleteAllNotificationsByUserId(userId, tx) {
  const db = tx || prisma;
  return db.notification.deleteMany({
    where: { userId: Number(userId) },
  });
}

async function deleteNotificationById(id, tx) {
  const db = tx || prisma;
  return db.notification.deleteMany({
    where: { id: Number(id) },
  });
}

export const notificationsRepo = {
  findNotificationsListByUserId,
  addNotification,
  deleteAllNotificationsByUserId,
  deleteNotificationById,
};

import { prisma } from '../db/prisma.js';

async function findLike({ workId, userId }, tx) {
  const db = tx || prisma;
  return db.like.findUnique({
    where: {
      workId_userId: {
        workId: Number(workId),
        userId: Number(userId),
      },
    },
  });
}

async function createLike({ workId, userId }, tx) {
  const db = tx || prisma;
  return db.like.create({
    data: {
      workId: Number(workId),
      userId: Number(userId),
    },
  });
}

async function deleteLike({ workId, userId }, tx) {
  const db = tx || prisma;
  return db.like.delete({
    where: {
      workId_userId: {
        workId: Number(workId),
        userId: Number(userId),
      },
    },
  });
}

export const likesRepo = { findLike, createLike, deleteLike };

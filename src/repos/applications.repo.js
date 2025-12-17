import { prisma } from '../db/prisma.js';

async function createApplication(data, tx) {
  const db = tx || prisma;
  return db.challengeApplication.create({ data });
}

async function findApplicationById({ applicationId }, tx) {
  const db = tx || prisma;
  return db.challengeApplication.findUnique({
    where: { id: Number(applicationId) },
    include: {
      creator: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
    },
  });
}

async function findApplicationsList({ where, skip, take, orderBy }, tx) {
  const db = tx || prisma;
  const [totalCount, list] = await Promise.all([
    db.challengeApplication.count({ where }),
    db.challengeApplication.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return [totalCount, list];
}

async function updateApplication({ applicationId, data }, tx) {
  const db = tx || prisma;
  return db.challengeApplication.update({
    where: { id: Number(applicationId) },
    data,
  });
}

async function deleteApplication({ applicationId }, tx) {
  const db = tx || prisma;
  return db.challengeApplication.delete({
    where: { id: Number(applicationId) },
  });
}

export const applicationsRepo = {
  createApplication,
  findApplicationsList,
  findApplicationById,
  updateApplication,
  deleteApplication,
};

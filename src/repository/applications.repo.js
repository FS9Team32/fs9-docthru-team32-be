import { prisma } from '../db/prisma.js';
/**
 * @param {Object} data - { challengeId, workerId, content }
 * @param {Object} [tx] - 트랜잭션 클라이언트 (옵션)
 */

async function createApplication(data, tx) {
  const db = tx || prisma;
  return db.challengeApplication.create({ data });
}
async function findApplicationsByUserId({ userId }, tx) {
  const db = tx || prisma;
  return db.ChallengeApplication.findUnique({
    where: { id: Number(userId) },
    include: {
      creator: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      challenges: true, // 승인된 챌린지가 연결되어 있으면 포함
    },
  });
}
async function findApplicationByApplicationId({ applicationId }, tx) {
  const db = tx || prisma;
  return db.ChallengeApplication.findUnique({
    where: { id: Number(applicationId) },
    include: {
      creator: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      challenges: true, // 승인된 챌린지가 연결되어 있으면 포함
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
        challenges: true,
      },
    }),
  ]);

  return [totalCount, list];
}

async function updateApplication({ applicationId, data }, tx) {
  console.log(
    'repo findApplicationByApplicationId param:',
    applicationId,
    Number(applicationId),
  );

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
  findApplicationsByUserId,
  findApplicationByApplicationId,
  updateApplication,
  deleteApplication,
};

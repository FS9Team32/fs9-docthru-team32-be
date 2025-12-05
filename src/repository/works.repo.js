import { prisma } from '../db/prisma.js';

/**
 * @param {Object} data - { challengeId, workerId, content }
 * @param {Object} [tx] - 트랜잭션 클라이언트 (옵션)
 */
async function createWork({ challengeId, workerId, content }, tx) {
  const db = tx || prisma; // tx가 있으면 사용, 없으면 기본 prisma 사용

  const newWork = {
    challengeId,
    workerId,
    content,
  };

  return db.work.create({ data: newWork });
}

async function findWorksListByChallengeId(
  { challengeId, whereOptions = {}, orderByOptions = [], skip, take },
  tx,
) {
  const db = tx || prisma;

  const where = {
    challengeId: Number(challengeId),
    ...whereOptions,
  };

  const pagination = {
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  };

  // tx가 넘어왔을 때도 안전하게 병렬 처리하기 위해 Promise.all 사용
  return Promise.all([
    db.work.count({
      where,
    }),
    db.work.findMany({
      where,
      include: {
        worker: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
      orderBy: [{ likeCount: 'desc' }, ...orderByOptions],
      ...pagination,
    }),
  ]);
}

async function countWorksByChallengeId(challengeId, tx) {
  const db = tx || prisma;
  return db.work.count({
    where: { challengeId: Number(challengeId) },
  });
}

async function findSelectedWorksCountByWorkerId(workerId, tx) {
  const db = tx || prisma;
  return db.work.count({
    where: { workerId: Number(workerId), isSelected: true },
  });
}

async function findWorkById(workId, tx) {
  const db = tx || prisma;
  return db.work.findUnique({
    where: { id: Number(workId) },
    include: {
      worker: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
    },
  });
}

async function updateWork({ workId, data }, tx) {
  const db = tx || prisma;
  return db.work.update({ where: { id: Number(workId) }, data });
}

async function deleteWork(workId, tx) {
  const db = tx || prisma;
  return await db.work.delete({ where: { id: Number(workId) } });
}

export const worksRepo = {
  createWork,
  findWorksListByChallengeId,
  countWorksByChallengeId,
  findSelectedWorksCountByWorkerId,
  findWorkById,
  updateWork,
  deleteWork,
};

import { prisma } from '../db/prisma.js';

async function createWork({ challengeId, workerId, content }) {
  const newWork = {
    challengeId,
    workerId,
    content,
  };

  return prisma.work.create({ data: newWork });
}

async function findWorksListByChallengeId({
  challengeId,
  whereOptions = {},
  orderBy = [],
  skip,
  take,
}) {
  const where = {
    challengeId: Number(challengeId),
    ...whereOptions,
  };

  const pagination = {
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  };

  return prisma.$transaction([
    prisma.work.count({
      where,
    }),
    prisma.work.findMany({
      where,
      orderBy: [{ likeCount: 'desc' }, ...orderBy],
      ...pagination,
    }),
  ]);
}

async function findSelectedWorksCountByWorkerId(workerId) {
  return prisma.work.count({
    where: { workerId: Number(workerId), isSelected: true },
  });
}

async function findWorkById(workId) {
  return prisma.work.findUnique({ where: { id: Number(workId) } });
}

async function updateWork({ workId, data }) {
  return prisma.work.update({ where: { id: Number(workId) }, data });
}

async function deleteWork(workId) {
  return await prisma.work.delete({ where: { id: Number(workId) } });
}

export const worksRepo = {
  createWork,
  findWorksListByChallengeId,
  findSelectedWorksCountByWorkerId,
  findWorkById,
  updateWork,
  deleteWork,
};

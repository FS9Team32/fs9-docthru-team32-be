import { prisma } from '../db/prisma.js';

async function findChallengeById({ challengeId }, tx) {
  const db = tx || prisma;
  return db.challenge.findUnique({
    where: { id: Number(challengeId) },
  });
}

async function findChallengeList({ where, skip, take, orderBy }) {
  const [totalCount, originList] = await prisma.$transaction([
    prisma.challenge.count({ where }),

    prisma.challenge.findMany({
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
        _count: {
          select: { works: true },
        },
      },
    }),
  ]);

  const list = originList.map(({ _count, ...rest }) => ({
    ...rest,
    workCount: _count.works,
  }));

  return [totalCount, list];
}
async function createChallenge(challengeData, tx) {
  const db = tx || prisma;
  return db.challenge.create({ data: challengeData });
}

async function updateChallenge({ challengeId, data }) {
  return prisma.challenge.update({
    where: { id: Number(challengeId) },
    data,
  });
}

async function updateChallengeStatus(challengeId, status, tx) {
  const db = tx || prisma;
  return db.challenge.update({
    where: { id: Number(challengeId) },
    data: { status },
  });
}

async function findApplicationById(applicationId, tx = prisma) {
  const originData = await tx.challenge.findUnique({
    where: { applicationId },
    include: {
      creator: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      _count: {
        select: { works: true }, // 🔥 작업물 개수 조회
      },
    },
  });

  if (!originData) return null;

  const { _count, ...rest } = originData;

  return {
    ...rest,
    workCount: _count.works,
  };
}
async function deleteChallenge({ challengeId }) {
  return prisma.challenge.delete({
    where: { id: Number(challengeId) },
  });
}

export const challengesRepo = {
  createChallenge,
  updateChallenge,
  findChallengeList,
  findApplicationById,
  findChallengeById,
  updateChallengeStatus,
  deleteChallenge,
};

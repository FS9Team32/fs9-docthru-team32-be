import { prisma } from '../db/prisma.js';

async function findChallengeList({ where, skip, take, orderBy }, tx) {
  const db = tx || prisma;
  const [totalCount, originList] = await db.$transaction([
    db.challenge.count({ where }),

    db.challenge.findMany({
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

async function updateChallenge({ challengeId, data }, tx) {
  const db = tx || prisma;
  return db.challenge.update({
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

async function findChallengeById({ challengeId }, tx) {
  const db = tx || prisma;
  const originData = await db.challenge.findUnique({
    where: { id: Number(challengeId) },
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
  });

  if (!originData) return null;
  const { _count, ...rest } = originData;
  return {
    ...rest,
    workCount: _count.works,
  };
}
async function deleteChallenge({ challengeId }, tx) {
  const db = tx || prisma;
  return db.challenge.delete({
    where: { id: Number(challengeId) },
  });
}

export const challengesRepo = {
  createChallenge,
  updateChallenge,
  findChallengeList,
  findChallengeById,
  updateChallengeStatus,
  deleteChallenge,
};

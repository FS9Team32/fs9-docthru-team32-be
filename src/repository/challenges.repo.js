import { prisma } from '../db/prisma.js';

async function findChallengeById({ challengeId }, tx) {
  const db = tx || prisma;
  return db.challenge.findUnique({
    where: { id: Number(challengeId) },
  });
}

async function findChallengeList({ where, skip, take, orderBy }) {
  const [totalCount, list] = await Promise.all([
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
      },
    }),
  ]);

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
  return tx.challenge.findUnique({
    where: { applicationId },
  });
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

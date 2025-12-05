import { prisma } from '../db/prisma.js';

async function findChallengeById(challengeId, tx) {
  const db = tx || prisma;
  return db.challenge.findUnique({
    where: { id: Number(challengeId) },
  });
}

async function updateChallengeStatus(challengeId, status, tx) {
  const db = tx || prisma;
  return db.challenge.update({
    where: { id: Number(challengeId) },
    data: { status },
  });
}

export const challengesRepo = {
  findChallengeById,
  updateChallengeStatus,
};

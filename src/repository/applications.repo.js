import { prisma } from '../db/prisma.js';

async function createApplication(data) {
  return prisma.challengeApplication.create({ data });
}
async function findApplicationsByUserId({ userId }) {
  return prisma.ChallengeApplication.findUnique({
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
async function findApplicationByApplicationId({ applicationId }) {
  return prisma.ChallengeApplication.findUnique({
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

async function findApplicationsList({ where, skip, take, orderBy }) {
  const [totalCount, list] = await Promise.all([
    prisma.challengeApplication.count({ where }),
    prisma.challengeApplication.findMany({
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

async function updateApplication({ applicationId, data }) {
  return prisma.challengeApplication.update({
    where: { id: Number(applicationId) },
    data,
  });
}

async function deleteApplication({ applicationId }) {
  return prisma.challengeApplication.delete({
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

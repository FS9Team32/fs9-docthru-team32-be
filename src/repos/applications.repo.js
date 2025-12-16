import { prisma } from '../db/prisma.js';

async function createApplication(data) {
  return prisma.challengeApplication.create({ data });
}

async function findApplicationById({ applicationId }) {
  return prisma.challengeApplication.findUnique({
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
      },
    }),
  ]);

  return [totalCount, list];
}

async function updateApplication({ applicationId, data }, tx) {
  return tx.challengeApplication.update({
    where: { id: Number(applicationId) },
    data,
  });
}

async function deleteApplication({ applicationId }, tx) {
  return tx.challengeApplication.delete({
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

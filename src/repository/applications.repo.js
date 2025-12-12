import { prisma } from '../db/prisma.js';

async function createApplication(data) {
  return prisma.challengeApplication.create({ data });
}
// async function findApplicationsByUserId({ userId }) {
//   return prisma.ChallengeApplication.findUnique({
//     where: { id: Number(userId) },
//     include: {
//       creator: {
//         select: {
//           id: true,
//           nickname: true,
//           role: true,
//         },
//       },
//       challenges: true,
//     },
//   });
// }
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

import { prisma } from '../db/prisma.js';
/**
 * @param {Object} data - { challengeId, workerId, content }
 * @param {Object} [tx] - 트랜잭션 클라이언트 (옵션)
 */

async function createApplication(data, tx) {
  const db = tx || prisma;

  const dto = {
    creatorId: Number(data.creatorId),
    title: data.title,
    category: data.category,
    documentType: data.documentType,
    originalLink: data.originalLink,
    description: data.description,
    maxParticipants:
      data.maxParticipants !== undefined ? Number(data.maxParticipants) : 1,
    status: 'PENDING',
    deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
  };

  return db.challengeApplication.create({
    data: {
      ...dto,
    },
  });
}

// async function findApplicationsList(
//   { whereOptions = {}, orderByOptions = [], skip, take },
//   tx,
// ) {
//   const db = tx || prisma;

//   const pagination = {
//     ...(skip !== undefined && { skip }),
//     ...(take !== undefined && { take }),
//   };

//   return Promise.all([
//     db.ChallengeApplication.count({
//       where: { whereOptions },
//     }),
//     db.ChallengeApplication.findMany({
//       where: { whereOptions },
//       include: {
//         creator: {
//           select: {
//             id: true,
//             nickname: true,
//             role: true,
//           },
//         },
//       },
//       orderBy: { orderByOptions },
//       ...pagination,
//     }),
//   ]);
// }

// 신청서 조회./ 수정 / 삭제

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
  // findApplicationsList,
  findApplicationsByUserId,
  findApplicationByApplicationId,
  updateApplication,
  deleteApplication,
};

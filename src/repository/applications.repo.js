import { prisma } from '../db/prisma.js';

// 신청서 생성

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
    deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
  };

  return db.ChallengeApplication.create({
    data: {
      ...dto,
    },
  });
}
async function findApplicationsList(
  { whereOptions = {}, orderByOptions = [], skip, take },
  tx,
) {
  const db = tx || prisma;

  const pagination = {
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  };

  return Promise.all([
    db.challengeApplication.count({
      where: { whereOptions },
    }),
    db.challengeApplication.findMany({
      where: { whereOptions },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
      orderBy: { orderByOptions },
      ...pagination,
    }),
  ]);
}

// 신청서 조회./ 수정 / 삭제

async function findApplicationById(applicationId, tx) {
  const db = tx || prisma;
  return db.challengeApplication.findUnique({
    where: { id: Number(applicationId) },
    include: {
      creator: {
        select: { applicationId: true, nickname: true, role: true },
      },
      challenges: true, // 승인된 챌린지가 연결되어 있으면 포함
    },
  });
}

async function updateApplication({ applicationId, data }, tx) {
  const db = tx || prisma;
  return db.challengeApplication.update({
    where: { id: Number(applicationId) },
    data,
  });
}

async function deleteApplication(applicationId, tx) {
  const db = tx || prisma;

  return db.challengeApplication.delete({
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

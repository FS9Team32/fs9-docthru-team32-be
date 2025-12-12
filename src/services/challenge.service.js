import { prisma } from '../db/prisma.js';
import { challengesRepo } from '../repository/challenges.repo.js';
import { applicationsRepo } from '../repository/applications.repo.js';
import { isAuthorized } from '../utils/permission.js';

export async function getChallengesList({ query }) {
  const {
    page = 1,
    pageSize = 10,
    status,
    category,
    type,
    orderby,
    keyword,
  } = query;

  const skip = (page - 1) * pageSize;
  const orderBy = orderby ? { [orderby]: 'desc' } : { createdAt: 'desc' };

  const where = {
    ...(status && { status }),
    ...(category && { category }),
    ...(type && { documentType: type }),
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { category: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
  };

  const [totalCount, list] = await challengesRepo.findChallengeList({
    where,
    skip,
    take: pageSize,
    orderBy,
  });

  return {
    totalCount,
    page,
    pageSize,
    list,
  };
}

async function getMyChallenges(userId) {
  return challengesRepo.findChallengesByCreatorId(userId);
}

async function getChallengeById({ challengeId, userId }) {
  const challenge = await challengesRepo.findChallengeById({ challengeId });
  console.log(challenge);
  console.log(userId);
  if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');
  isAuthorized(challenge.creatorId, userId);
  return challenge;
}

async function createChallenge({ applicationId }) {
  return prisma.$transaction(async (tx) => {
    const application = await applicationsRepo.findApplicationById(
      {
        applicationId,
      },
      tx,
    );

    if (!application) throw new Error('신청서를 찾을 수 없습니다.');

    const updatedApplication = await applicationsRepo.updateApplication(
      {
        applicationId: application.id,
        data: { status: 'APPROVED' },
      },
      tx,
    );

    const existing = await challengesRepo.findApplicationById(
      applicationId,
      tx,
    );

    if (existing) {
      throw new Error('이미 생성된 챌린지입니다.');
    }

    const challengeData = {
      application: { connect: { id: application.id } },
      creator: { connect: { id: application.creatorId } },
      title: application.title,
      documentType: application.documentType,
      description: application.description,
      deadlineAt: application.deadlineAt,
      originalLink: application.originalLink,
      maxParticipants: application.maxParticipants,
      category: application.category,
    };
    const newChallenge = await challengesRepo.createChallenge(
      challengeData,
      tx,
    );
    return {
      application: updatedApplication,
      challenge: newChallenge,
    };
  });
}

async function updatechallenge({ challengeId, data }) {
  return challengesRepo.updateChallenge({ challengeId, data });
}

async function deleteChallenge({ challengeId, adminFeedback }) {
  return prisma.$transaction(async (tx) => {
    const challenge = await challengesRepo.findChallengeById(
      { challengeId },
      tx,
    );
    if (!challenge) throw new Error('챌린지를 찾을 수 없습니다.');

    const application = await applicationsRepo.findApplicationById(
      { applicationId: challenge.applicationId },
      tx,
    );

    if (!application) throw new Error('신청서를 찾을 수 없습니다.');
    if (application.status !== 'APPROVED') {
      throw new Error('승인 완료된 신청서만 받을 수 있습니다.');
    }

    const deletedChallenge = await challengesRepo.deleteChallenge({
      challengeId,
    });
    const deletedApplication = await applicationsRepo.updateApplication(
      {
        applicationId: application.id,
        data: {
          status: 'DELETED',
          adminFeedback,
        },
      },
      tx,
    );

    return {
      challenge: deletedChallenge,
      application: deletedApplication,
    };
  });
}

export default {
  createChallenge,
  getChallengesList,
  getMyChallenges,
  getChallengeById,
  updatechallenge,
  deleteChallenge,
};

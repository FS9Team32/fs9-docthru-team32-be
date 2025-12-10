import { prisma } from '../db/prisma.js';
import { applicationsRepo } from '../repository/applications.repo.js';
import { challengesRepo } from '../repository/challenges.repo.js';
import { NotFoundException } from '../err/notFoundException.js';
import { ForbiddenException } from '../err/forbiddenException.js';

async function createApplication(data) {
  return applicationsRepo.createApplication(data);
}

async function getMyApplications({ userId }) {
  const userData = await applicationsRepo.findApplicationsByUserId({ userId });
  if (!userData) {
    throw new NotFoundException(
      '유저의 신청서가 존재하지 않습니다. 다시 확인해 주세요.',
    );
  }
}

async function getApplicationById({ applicationId }) {
  const applicationData = await applicationsRepo.findApplicationByApplicationId(
    { applicationId },
  );
  if (!applicationData) {
    throw new NotFoundException(
      '신청서가 존재하지 않습니다. 다시 확인해 주세요.',
    );
  }
  return applicationData;
}

async function updateApplication({ applicationId, userId, data }, tx) {
  const db = tx || prisma;

  const prev = await getApplicationById({ applicationId });
  if (prev.creator.id !== userId) {
    throw new ForbiddenException('신청서를 수정할 권한이 없습니다.');
  }
  return applicationsRepo.updateApplication({ applicationId, data }, db);
}

async function deleteApplication({ applicationId, userId }) {
  const prev = await getApplicationById({ applicationId });
  if (prev.creator.id !== userId) {
    throw new ForbiddenException('신청서를 삭제할 권한이 없습니다.');
  }
  return applicationsRepo.deleteApplication({ applicationId });
}

async function getApplicationsList({ userId, query }) {
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

  const where = {
    creatorId: userId,
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

  const orderBy = orderby ? { [orderby]: 'desc' } : { createdAt: 'desc' };

  const [totalCount, list] = await applicationsRepo.findApplicationsList({
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

async function approveApplication(applicationId) {
  return prisma.$transaction(async (tx) => {
    const application = await applicationsRepo.findApplicationById(
      applicationId,
      tx,
    );
    if (!application) throw new Error('Application not found');

    if (application.status !== 'PENDING') {
      throw new Error('Application is not in PENDING status');
    }

    const updated = await applicationsRepo.updateApplication(
      applicationId,
      {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
      tx,
    );

    const challenge = await challengesRepo.createChallengeFromApplication(
      application,
      tx,
    );

    return {
      application: updated,
      challenge,
    };
  });
}

async function rejectApplication(applicationId, adminFeedback) {
  return applicationsRepo.updateApplication(applicationId, {
    status: 'REJECTED',
    adminFeedback,
    reviewedAt: new Date(),
  });
}

export default {
  createApplication,
  getApplicationsList,
  getMyApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
  rejectApplication,
};

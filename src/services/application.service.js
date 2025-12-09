import { applicationsRepo } from '../repository/applications.repo.js';
import { challengesRepo } from '../repository/challenges.repo.js';
import { prisma } from '../db/prisma.js';

async function createApplication(data) {
  return applicationsRepo.createApplication(data);
}

async function getApplicationsList({
  page = 1,
  limit = 10,
  status,
  category,
  orderby,
}) {
  const skip = (page - 1) * limit;

  const [totalCount, list] = await applicationsRepo.findApplications({
    whereOptions: {
      ...(status && { status }),
      ...(category && { category }),
    },
    orderByOptions: orderby ? [{ [orderby]: 'desc' }] : [],
    skip,
    take: limit,
  });

  return {
    totalCount,
    list,
    page,
    limit,
  };
}

async function getMyApplications(userId) {
  return applicationsRepo.findApplicationsByUserId(userId);
}

async function getApplicationById(applicationId) {
  return applicationsRepo.findApplicationById(applicationId);
}

async function updateApplication(applicationId, data) {
  return applicationsRepo.updateApplication(applicationId, data);
}

async function deleteApplication(applicationId) {
  return applicationsRepo.deleteApplication(applicationId);
}

/**
 * 관리자 승인 → Challenge 생성
 */
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

    // 1) 신청서 → APPROVED 업데이트
    const updated = await applicationsRepo.updateApplication(
      applicationId,
      {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
      tx,
    );

    // 2) Challenge 생성
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

/**
 * 관리자 거절
 */
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

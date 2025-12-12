import { applicationsRepo } from '../repository/applications.repo.js';
import { NotFoundException } from '../err/notFoundException.js';
import { ForbiddenException } from '../err/forbiddenException.js';

async function createApplication(data) {
  return applicationsRepo.createApplication(data);
}

async function getApplicationById({ applicationId }) {
  const applicationData = await applicationsRepo.findApplicationById({
    applicationId,
  });
  if (!applicationData) {
    throw new NotFoundException(
      '신청서가 존재하지 않습니다. 다시 확인해 주세요.',
    );
  }
  return applicationData;
}

async function updateApplication({ applicationId, status, adminFeedback }) {
  const data = { status, adminFeedback };

  console.log('service params:', { applicationId, status, adminFeedback });
  return applicationsRepo.updateApplication({ applicationId, data });
}

async function deleteApplication({ applicationId, userId }) {
  const prev = await getApplicationById({ applicationId });
  if (prev.creator.id !== userId) {
    throw new ForbiddenException('신청서를 삭제할 권한이 없습니다.');
  }
  return applicationsRepo.deleteApplication({ applicationId });
}

async function getApplicationsListForUser({ userId, query }) {
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
    creatorId: userId, // 본인 데이터만
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
export async function getApplicationsListForAdmin({ query }) {
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

export default {
  createApplication,
  getApplicationsListForUser,
  getApplicationsListForAdmin,
  getApplicationById,
  updateApplication,
  deleteApplication,
};

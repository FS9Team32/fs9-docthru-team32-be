import { prisma } from '../db/prisma.js';
import { worksRepo } from '../repos/works.repo.js';
import { challengesRepo } from '../repos/challenges.repo.js';
import { NotFoundException } from '../err/notFoundException.js';
import { ConflictException } from '../err/conflictException.js';
import { isAuthorized } from '../utils/permission.js';

async function createWork(workData) {
  return await prisma.$transaction(
    async (tx) => {
      // 1. 챌린지 존재 여부 확인 (tx 전달)
      const challenge = await challengesRepo.findChallengeById(
        workData.challengeId,
        tx,
      );
      if (!challenge) {
        throw new NotFoundException(
          '챌린지가 존재하지 않습니다. 다시 확인해 주세요.',
        );
      }

      // 2-1. 기참여 여부 확인 (tx 전달)
      const [existingWorkCount] = await worksRepo.findWorksListByChallengeId(
        {
          challengeId: workData.challengeId,
          whereOptions: { workerId: workData.workerId },
        },
        tx,
      );
      if (existingWorkCount > 0) {
        throw new ConflictException('이미 참여한 챌린지입니다.');
      }

      // 2-2. 현재 참가자 수 확인 (tx 전달)
      const currentCount = await worksRepo.countWorksByChallengeId(
        workData.challengeId,
        tx,
      );
      const maxParticipants = challenge.maxParticipants;

      // 3. 비즈니스 로직 검증 (모집 상태 및 인원)
      if (
        challenge.status !== 'RECRUITING' ||
        currentCount >= maxParticipants
      ) {
        throw new ConflictException(
          '모집이 완료되었거나 기한이 마감된 챌린지 입니다.',
        );
      }

      // 4. 작업물 생성 (tx 전달)
      const newWork = await worksRepo.createWork(workData, tx);

      // 5. 만약 이번 생성으로 인원이 꽉 찼다면 상태 업데이트 (tx 전달)
      // (현재 인원 + 이번에 추가된 1명) >= 최대 인원
      if (currentCount + 1 >= maxParticipants) {
        await challengesRepo.updateChallengeStatus(
          workData.challengeId,
          'FILLED',
          tx,
        );
      }

      return newWork;
    },
    {
      isolationLevel: 'Serializable', // 동시성 문제 해결을 위한 격리 수준 설정
    },
  );
}

async function getChallengeWorksList(challengeId, { page = 1, limit = 10 }) {
  // 1. 챌린지 존재 확인
  const challenge = await challengesRepo.findChallengeById({ challengeId });
  if (!challenge) {
    throw new NotFoundException(
      '챌린지가 존재하지 않습니다. 다시 확인해 주세요.',
    );
  }

  const skip = (page - 1) * limit;
  const take = limit;

  // 2. DB에서 순위가 계산된 작업물 목록을 페이지네이션하여 조회
  const [totalCount, rankedList] =
    await worksRepo.findWorksListWithRankByChallengeId({
      challengeId,
      skip,
      take,
    });

  return { totalCount, rankedList };
}

async function getChallengeWorksCount(challengeId) {
  return await worksRepo.countWorksByChallengeId(challengeId);
}

async function getWork(id) {
  const workData = await worksRepo.findWorkById(id);
  if (!workData) {
    throw new NotFoundException('작업물이 존재하지 않습니다.');
  }
  return workData;
}

async function updateWork({ workId, userId, role, content }) {
  const prevWork = await getWork(workId);

  isAuthorized(prevWork.workerId, userId, role);

  const data = {
    content,
    editedAt: new Date(),
  };

  const updatedWork = await worksRepo.updateWork({
    workId,
    data,
  });
  return updatedWork;
}

async function deleteWork({ workId, userId, role }) {
  const prevWork = await getWork(workId);

  isAuthorized(prevWork.workerId, userId, role);

  const deletedWork = await worksRepo.deleteWork(workId);
  return deletedWork;
}

export default {
  createWork,
  getChallengeWorksList,
  getChallengeWorksCount,
  getWork,
  updateWork,
  deleteWork,
};

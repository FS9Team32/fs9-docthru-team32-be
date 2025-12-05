import { prisma } from '../db/prisma.js';
import { worksRepo } from '../repository/works.repo.js';
import { challengesRepo } from '../repository/challenges.repo.js';
import { NotFoundException } from '../err/notFoundException.js';
import { ConflictException } from '../err/conflictException.js';
import { ForbiddenException } from '../err/forbiddenException.js';

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

      // 2. 현재 참가자 수 확인 (tx 전달)
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

async function getChallengeWorksList(challengeId) {
  // 1. 챌린지 존재 확인
  const challenge = await worksRepo.findChallengeById(challengeId);
  if (!challenge) {
    throw new NotFoundException(
      '챌린지가 존재하지 않습니다. 다시 확인해 주세요.',
    );
  }

  // 2. 목록 및 전체 개수 조회
  const [totalCount, list] = await worksRepo.findWorksListByChallengeId({
    challengeId,
  });

  // 3. 순위 부여 로직 (1, 1, 3 방식)
  let currentRank = 1;
  const rankedList = list.map((item, index) => {
    // 첫 번째가 아니고, 이전 항목과 좋아요 수가 다르면 현재 인덱스+1을 순위로 설정
    if (index > 0 && item.likeCount !== list[index - 1].likeCount) {
      currentRank = index + 1;
    }
    return { ...item, rank: currentRank };
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

async function updateWork({ workId, userId, content }) {
  const prevWork = await getWork(workId);

  if (prevWork.workerId !== userId) {
    throw new ForbiddenException('작업물을 수정할 권한이 없습니다.');
  }

  const updatedWork = await worksRepo.updateWork({
    workId,
    data: { content },
  });
  return updatedWork;
}

async function deleteWork({ workId, userId }) {
  const prevWork = await getWork(workId);

  if (prevWork.workerId !== userId) {
    throw new ForbiddenException('작업물을 수정할 권한이 없습니다.');
  }

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

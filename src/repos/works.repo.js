import { prisma } from '../db/prisma.js';

/**
 * @param {Object} data - { challengeId, workerId, content }
 * @param {Object} [tx] - 트랜잭션 클라이언트 (옵션)
 */
async function createWork({ challengeId, workerId, content }, tx) {
  const db = tx || prisma; // tx가 있으면 사용, 없으면 기본 prisma 사용

  const newWork = {
    challengeId,
    workerId,
    content,
  };

  return db.work.create({ data: newWork });
}

async function findWorksListByChallengeId(
  { challengeId, whereOptions = {}, orderByOptions = [], skip, take },
  tx,
) {
  const db = tx || prisma;

  const where = {
    challengeId: Number(challengeId),
    ...whereOptions,
  };

  const pagination = {
    ...(skip !== undefined && { skip }),
    ...(take !== undefined && { take }),
  };

  // tx가 넘어왔을 때도 안전하게 병렬 처리하기 위해 Promise.all 사용
  return Promise.all([
    db.work.count({
      where,
    }),
    db.work.findMany({
      where,
      include: {
        worker: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
      orderBy: [{ likeCount: 'desc' }, ...orderByOptions],
      ...pagination,
    }),
  ]);
}

async function findWorksListWithRankByChallengeId(
  { challengeId, skip = 0, take = 10 },
  tx,
) {
  const db = tx || prisma;
  const where = { challengeId: Number(challengeId) };

  // 1. 데이터 조회 (총 개수와 목록을 병렬로 요청하여 속도 향상)
  const [totalCount, works] = await Promise.all([
    db.work.count({ where }),
    db.work.findMany({
      where,
      include: {
        worker: { select: { id: true, nickname: true, role: true } },
      },
      orderBy: [{ likeCount: 'desc' }, { createdAt: 'asc' }],
      skip,
      take,
    }),
  ]);

  // 데이터가 없으면 즉시 반환
  if (works.length === 0) return [totalCount, []];

  // 2. 시작 순위 계산 (현재 페이지 첫 아이템의 전역 순위)
  // 나보다 좋아요가 많은 사람 수 + 1 = 내 등수
  const higherRankersCount = await db.work.count({
    where: {
      ...where,
      likeCount: { gt: works[0].likeCount },
    },
  });

  // 3. 순위 매핑 (메모리 연산)
  let currentRank = higherRankersCount + 1;

  const rankedWorks = works.map((work, index) => {
    const isScoreDropped =
      index > 0 && work.likeCount < works[index - 1].likeCount;

    // 점수가 떨어졌다면, 현재의 '전역 인덱스(skip + index) + 1'이 새로운 순위가 됨
    if (isScoreDropped) {
      currentRank = skip + index + 1;
    }

    return { ...work, rank: currentRank };
  });

  return [totalCount, rankedWorks];
}

async function countWorksByChallengeId(challengeId, tx) {
  const db = tx || prisma;
  return db.work.count({
    where: { challengeId: Number(challengeId) },
  });
}

async function findWorkById(workId, tx) {
  const db = tx || prisma;
  return db.work.findUnique({
    where: { id: Number(workId) },
    include: {
      worker: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      challenge: true,
      comments: {
        include: {
          author: { select: { id: true, nickname: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

async function updateWork({ workId, data }, tx) {
  const db = tx || prisma;
  return db.work.update({ where: { id: Number(workId) }, data });
}

async function deleteWork(workId, tx) {
  const db = tx || prisma;
  return await db.work.delete({ where: { id: Number(workId) } });
}
async function countWorksByWorkerId(workerId, tx) {
  const db = tx || prisma;
  return db.work.count({
    where: { workerId: Number(workerId) },
  });
}

async function findSelectedWorksCountByWorkerId(workerId, tx) {
  const db = tx || prisma;
  return db.work.count({
    where: {
      workerId: Number(workerId),
      isSelected: true,
    },
  });
}

export const worksRepo = {
  createWork,
  findWorksListByChallengeId,
  findWorksListWithRankByChallengeId,
  countWorksByChallengeId,
  findSelectedWorksCountByWorkerId,
  countWorksByWorkerId,
  findWorkById,
  updateWork,
  deleteWork,
};

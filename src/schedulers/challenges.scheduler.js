import cron from 'node-cron';
import { prisma } from '../db/prisma.js';

async function closeExpiredChallenges() {
  const now = new Date();

  const challenges = await prisma.challenge.findMany({
    where: {
      status: 'RECRUITING',
      deadlineAt: { lte: now },
    },
  });

  for (const challenge of challenges) {
    await prisma.$transaction(async (tx) => {
      // 1. 해당 챌린지의 최고 likeCount 가져오기
      const maxLikeWork = await tx.work.findFirst({
        where: { challengeId: challenge.id },
        orderBy: [{ likeCount: 'desc' }],
      });

      if (maxLikeWork) {
        const maxLikeCount = maxLikeWork.likeCount;
        // 2. 최고 likeCount를 가진 모든 work 찾기
        const winners = await tx.work.findMany({
          where: {
            challengeId: challenge.id,
            likeCount: maxLikeCount,
          },
        });
        // 3. 모든 winner를 selected 처리
        await Promise.all(
          winners.map((work) =>
            tx.work.update({
              where: { id: work.id },
              data: { isSelected: true },
            }),
          ),
        );
      }
      // 4. 챌린지 상태를 CLOSED로
      await tx.challenge.update({
        where: { id: challenge.id },
        data: { status: 'CLOSED' },
      });
    });
  }
}

export function startChallengeScheduler() {
  // 매 12시간마다 (0시와 12시)
  cron.schedule('0 0,12 * * *', async () => {
    try {
      await closeExpiredChallenges();
    } catch (e) {
      console.error('챌린지 스케줄러 오류', e);
    }
  });
}

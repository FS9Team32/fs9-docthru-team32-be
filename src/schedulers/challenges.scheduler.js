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
      const winner = await tx.work.findFirst({
        where: { challengeId: challenge.id },
        orderBy: [{ likeCount: 'desc' }],
      });
      if (winner) {
        await tx.work.update({
          where: { id: winner.id },
          data: { isSelected: true },
        });
      }
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

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
        orderBy: [
          { likeCount: 'desc' },
          { createdAt: 'asc' }, // 동점 방지
        ],
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

// (테스트용)
export function startChallengeScheduler() {
  cron.schedule('* * * * *', closeExpiredChallenges);
}

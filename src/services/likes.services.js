import { prisma } from '../db/prisma.js';
import { likesRepo } from '../repos/likes.repo.js';
import { worksRepo } from '../repos/works.repo.js';
import { NotFoundException } from '../err/notFoundException.js';
import { ConflictException } from '../err/conflictException.js';

async function createLike({ workId, userId }) {
  return await prisma.$transaction(async (tx) => {
    const work = await worksRepo.findWorkById({ workId }, tx);
    if (!work) {
      throw new NotFoundException('작업물을 찾을 수 없습니다.');
    }

    const existingLike = await likesRepo.findLike({ workId, userId }, tx);
    if (existingLike) {
      throw new ConflictException('이미 좋아요를 누른 작업물입니다.');
    }

    const newLike = await likesRepo.createLike({ workId, userId }, tx);

    await worksRepo.updateWork(
      {
        workId,
        data: { likeCount: { increment: 1 } },
      },
      tx,
    );

    return newLike;
  });
}

async function deleteLike({ workId, userId }) {
  return await prisma.$transaction(async (tx) => {
    const existingLike = await likesRepo.findLike({ workId, userId }, tx);
    if (!existingLike) {
      throw new NotFoundException('해당 작업물에 좋아요를 누르지 않았습니다.');
    }

    const deletedLike = await likesRepo.deleteLike({ workId, userId }, tx);

    await worksRepo.updateWork(
      {
        workId,
        data: { likeCount: { decrement: 1 } },
      },
      tx,
    );

    return deletedLike;
  });
}

export default { createLike, deleteLike };

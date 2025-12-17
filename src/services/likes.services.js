import { likesRepo } from '../repos/likes.repo.js';
import { worksRepo } from '../repos/works.repo.js';
import { NotFoundException } from '../err/notFoundException.js';
import { ConflictException } from '../err/conflictException.js';

async function createLike({ workId, userId }) {
  const work = await worksRepo.findWorkById({ workId });
  if (!work) {
    throw new NotFoundException('작업물을 찾을 수 없습니다.');
  }

  const existingLike = await likesRepo.findLike({ workId, userId });
  if (existingLike) {
    throw new ConflictException('이미 좋아요를 누른 작업물입니다.');
  }

  return likesRepo.createLike({ workId, userId });
}

async function deleteLike({ workId, userId }) {
  const existingLike = await likesRepo.findLike({ workId, userId });
  if (!existingLike) {
    throw new NotFoundException('해당 작업물에 좋아요를 누르지 않았습니다.');
  }

  return likesRepo.deleteLike({ workId, userId });
}

export default { createLike, deleteLike };

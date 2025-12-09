import { likesRepo } from '../repository/likes.repo';
import { worksRepo } from '../repository/works.repo';
import { NotFoundException } from '../err/notFoundException';
import { ConflictException } from '../err/conflictException';

async function createLike({ workId, userId }) {
  const work = await worksRepo.findWorkById(workId);
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

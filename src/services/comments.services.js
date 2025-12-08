import { NotFoundException } from '../err/notFoundException.js';
import { commentsRepo } from '../repository/comments.repo.js';
import { worksRepo } from '../repository/works.repo.js';

async function workExistece(workId) {
  const work = await worksRepo.findWorkById(workId);
  if (!work) {
    throw new NotFoundException('작업물을 찾을 수 없습니다');
  }
  return !!work;
}

async function createComment({ workId, userId, content }) {
  await workExistece(workId);
  return commentsRepo.createComment({
    workId,
    userId,
    content,
  });
}

async function getWorkCommentsList({ workId, limit, cursorId }) {
  await workExistece(workId);
  return commentsRepo.getCommentsListByWorkId({ workId, limit, cursorId });
}

async function commentExistence(commentId) {
  const comment = commentsRepo.getCommentById(commentId);
  if (!comment) {
    throw new NotFoundException('댓글을 찾을 수 없습니다.');
  }
  return !!comment;
}

async function updateComment({ commentId, content }) {
  await commentExistence(commentId);
  const data = { content };
  return commentsRepo.updateComment({ commentId, data });
}

async function deleteComment(commentId) {
  await commentExistence(commentId);
  return commentsRepo.deleteComment(commentId);
}

export default {
  createComment,
  getWorkCommentsList,
  updateComment,
  deleteComment,
};

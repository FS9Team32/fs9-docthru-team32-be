import { NotFoundException } from '../err/notFoundException.js';
import { UnauthorizedException } from '../err/unauthorizedException.js';
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
  const comment = await commentsRepo.getCommentById(commentId);
  if (!comment) {
    throw new NotFoundException('댓글을 찾을 수 없습니다.');
  }
  return comment;
}

async function updateComment({ commentId, userId, content }) {
  const comment = await commentExistence(commentId);
  if (userId !== comment.authorId) {
    throw new UnauthorizedException(
      '댓글의 작성자가 아니기 때문에 수정할 수 없습니다.',
    );
  }
  const data = { content };
  return commentsRepo.updateComment({ commentId, data });
}

async function deleteComment({ commentId, userId }) {
  const comment = await commentExistence(commentId);
  if (userId !== comment.authorId) {
    throw new UnauthorizedException(
      '댓글의 작성자가 아니기 때문에 삭제할 수 없습니다.',
    );
  }
  return commentsRepo.deleteComment(commentId);
}

export default {
  createComment,
  getWorkCommentsList,
  updateComment,
  deleteComment,
};

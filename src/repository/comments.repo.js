import { prisma } from '../db/prisma.js';

async function createComment({ workId, userId, content }) {
  return prisma.comment.create({
    data: {
      workId: Number(workId),
      authorId: Number(userId),
      content,
    },
  });
}

async function getCommentsListByWorkId({
  workId,
  limit = 10,
  cursorId = null,
}) {
  const queryOptions = {
    where: { workId: Number(workId) },
    include: {
      author: {
        nickname: true,
        role: true,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  };
  if (cursorId) {
    queryOptions.cursor = { id: cursorId };
    queryOptions.skip = 1;
  }
  const commentsList = await prisma.comment.findMany(queryOptions);
  let nextCursor = null;
  if (commentsList.length === limit) {
    nextCursor = commentsList[commentsList.length - 1].id;
  }
  return {
    list: commentsList,
    nextCursor,
  };
}

async function getCommentById(commentId) {
  return prisma.comment.findUnique({ where: { id: Number(commentId) } });
}

async function updateComment({ commentId, data }) {
  return prisma.comment.update({ where: { id: Number(commentId) }, data });
}

async function deleteComment(commentId) {
  return prisma.comment.delete({ where: { id: Number(commentId) } });
}

export const commentsRepo = {
  createComment,
  getCommentsListByWorkId,
  getCommentById,
  updateComment,
  deleteComment,
};

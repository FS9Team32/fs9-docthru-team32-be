import { ForbiddenException } from '../err/forbiddenException.js';

export function isAuthorized(targetCreatorId, userId, role) {
  const isAdmin = role === 'ADMIN';
  const isOwner = targetCreatorId === userId;

  if (isAdmin || isOwner) {
    return;
  }

  throw new ForbiddenException('동작에 대한 권한이 없습니다.');
}

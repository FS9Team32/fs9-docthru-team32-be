import express from 'express';
import authRouter from './auth.js';
import userRouter from './user.js';
import applicationsRouter from './applications.js';
import challengesRouter from './challenges.js';
import challengesWorksRouter from './challenges.works.js';
import worksRouter from './works.js';
import worksCommentsRouter from './works.comments.js';
import commentsRouter from './comments.js';
import worksLikesRouter from './works.likes.js';
import notificationsRouter from './notifications.js';

export const router = express.Router();

// 기본 라우트
router.get('/', (req, res) => {
  res.json({
    message: 'Hello Express!',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/challenge-applications', applicationsRouter);
router.use('/challenges', challengesRouter);
router.use('/challenges/:challengeId/works', challengesWorksRouter);
router.use('/works', worksRouter);
router.use('/works/:workId/comments', worksCommentsRouter);
router.use('/comments', commentsRouter);
router.use('/works/:workId/likes', worksLikesRouter);
router.use('/users/me/notifications', notificationsRouter);

export default router;

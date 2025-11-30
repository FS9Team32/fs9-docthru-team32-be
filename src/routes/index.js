import express from 'express';
import authRouter from './auth.js';
import challengesRouter from './challenges.js';
import meChallengesRouter from './me.challenges.js';
import challengesWorksRouter from './challenges.works.js';
import worksRouter from './works.js';
import worksCommentsRouter from './works.comments.js';
import commentsRouter from './comments.js';
import worksLikesRouter from './works.likes.js';

export const router = express.Router();

// 기본 라우트
router.get('/', (req, res) => {
  res.json({
    message: 'Hello Express!',
    timestamp: new Date().toISOString(),
  });
});

router.use('/', authRouter);
router.use('/me/challenges', meChallengesRouter);
router.use('/challenges', challengesRouter);
router.use('/challenges/:challengesId/works', challengesWorksRouter);
router.use('/works', worksRouter);
router.use('/works/:worksId/comments', worksCommentsRouter);
router.use('/comments', commentsRouter);
router.use('/works/:worksId/likes', worksLikesRouter);

export default router;

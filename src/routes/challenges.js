import express from 'express';
import challengesServices from '../services/challenge.service.js';
import auth from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

/**
 * 전체 챌린지 조회
 */
router.get('/', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { page, limit, category, status, orderby } = req.query;

    const result = await challengesServices.getChallengesList({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category,
      status,
      orderby,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 내 챌린지
 */
router.get('/me', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { userId } = req.auth;

    const result = await challengesServices.getMyChallenges(Number(userId));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 챌린지 상세 조회
 */
router.get('/:challengeId', auth.verifyAccessToken, async (req, res, next) => {
  try {
    const { challengeId } = req.params;

    const challenge = await challengesServices.getChallengeById(
      Number(challengeId),
    );

    res.status(200).json({
      success: true,
      challenge,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 챌린지 삭제 (관리자)
 */
router.delete(
  '/:challengeId',
  auth.verifyAccessToken,
  async (req, res, next) => {
    try {
      const { challengeId } = req.params;

      const deleted = await challengesServices.deleteChallenge(
        Number(challengeId),
      );

      res.status(200).json({
        success: true,
        challenge: deleted,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

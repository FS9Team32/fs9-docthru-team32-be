import express from 'express';
export const router = express.Router();

// 기본 라우트
router.get('/', (req, res) => {
  res.json({
    message: 'Hello Express!',
    timestamp: new Date().toISOString(),
  });
});

export default router;

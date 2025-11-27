export const requestTimer = (req, res, next) => {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`요청 처리 시간: ${duration}ms`);
  });

  next();
};

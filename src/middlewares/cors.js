import { isDevelopment, config } from '../config/config.js';

export const cors = (req, res, next) => {
  const origin = req.headers.origin || req.headers.host || '';
  const whiteList = config.FRONT_URL
    ? config.FRONT_URL.split(',').map((url) => url.trim())
    : [];
  const isAllowed = whiteList.includes(origin);
  const allowedOrigin = isAllowed || isDevelopment ? origin : whiteList[0];

  if (!allowedOrigin) {
    return next();
  }

  res.header('Access-Control-Allow-Origin', allowedOrigin);

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

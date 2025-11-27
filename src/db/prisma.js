import { PrismaClient } from '@prisma/client';
import { isDevelopment } from '../config/config.js';

const getPrismaLogLevel = () => {
  if (!isDevelopment) {
    return ['warn', 'error'];
  }
  //개발 환경에서만 추가 로깅 개방
  return ['query', 'info', 'warn', 'error'];
};

export const prisma = new PrismaClient({
  log: getPrismaLogLevel(),
});

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('📦 Disconnected from the database.');
  } catch (e) {
    console.error('❌ Error disconnecting from the database:', e);
    process.exit(1);
  }
}

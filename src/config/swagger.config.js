// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocThru API Docs',
      version: '1.0.0',
      description: 'DocThru 백엔드 API 명세서입니다.',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`, // 포트 번호에 맞게 수정
        description: 'Local Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // ★ 중요: 프로젝트 루트(package.json 위치) 기준 경로 설정
  // src/routes 폴더 아래의 모든 파일을 스캔합니다.
  apis: ['./src/routes/*.js', './src/routes/**/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;

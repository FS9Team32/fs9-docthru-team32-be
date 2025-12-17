// src/routes/applications.routes.js
import express from 'express';
import applicationsServices from '../services/applications.services.js';
import auth from '../middlewares/auth.js';
import {
  applicationsValidation,
  applicationsPatchValidation,
  applicationsQueryValidation,
} from '../validations/applications.validation.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: 챌린지 신청 관련 API
 */

/**
 * @swagger
 * /challenge-applications:
 *   post:
 *     summary: 챌린지 신청 생성
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - field
 *               - docUrl
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 챌린지 제목
 *               field:
 *                 type: string
 *                 description: 분야
 *               docUrl:
 *                 type: string
 *                 description: 문서 URL
 *               content:
 *                 type: string
 *                 description: 신청 내용
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: 마감일
 *     responses:
 *       200:
 *         description: 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 application:
 *                   type: object
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/',
  auth.verifyAccessToken,
  validate(applicationsValidation),
  async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const data = req.body;
      const dto = {
        creatorId: Number(userId),
        ...data,
      };

      const created = await applicationsServices.createApplication(dto);
      res.status(200).json({
        success: true,
        application: created,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /challenge-applications:
 *   get:
 *     summary: 챌린지 신청 목록 조회 (관리자)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 당 항목 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 상태 필터 (PENDING, ACCEPTED, REJECTED)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 순서
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalCount:
 *                   type: integer
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: 권한 없음
 */
router.get(
  '/',
  auth.verifyAccessToken,
  auth.requireAdmin,
  validate(applicationsQueryValidation, 'query'),
  async (req, res, next) => {
    try {
      const query = req.query;
      const data = await applicationsServices.getApplicationsListForAdmin({
        query,
      });

      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /challenge-applications/{applicationId}:
 *   get:
 *     summary: 챌린지 신청 상세 조회
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 신청 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: 신청 내역 없음
 */
router.get(
  '/:applicationId',
  auth.verifyAccessToken,
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { userId, role } = req.auth;
      const application = await applicationsServices.getApplicationById({
        applicationId: Number(applicationId),
        userId,
        role,
      });
      res.status(200).json({
        success: true,
        ...application,
      });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /challenge-application/applicationsId == 상태 수정, 피드백 전달
// 에 관련된 patch (어드민 권한)
/**
 * @swagger
 * /challenge-applications/{applicationId}:
 *   patch:
 *     summary: 챌린지 신청 상태 수정 (관리자)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 신청 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *               adminFeedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 application:
 *                   type: object
 *       403:
 *         description: 권한 없음
 */
router.patch(
  '/:applicationId',
  auth.verifyAccessToken,
  auth.requireAdmin,
  validate(applicationsPatchValidation, 'body'),
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { status, adminFeedback } = req.body;
      const updated = await applicationsServices.updateApplication({
        applicationId: Number(applicationId),
        status,
        adminFeedback,
      });
      res.status(200).json({
        success: true,
        application: updated,
      });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /challenge-application/applicationId == 유저가 PENDING시점일시 신청 취소
// 유저 권한
/**
 * @swagger
 * /challenge-applications/{applicationId}:
 *   delete:
 *     summary: 챌린지 신청 취소 (유저)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 신청 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: 취소 불가능한 상태
 */
router.delete(
  '/:applicationId',
  auth.verifyAccessToken,
  auth.forbidAdmin,
  async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { userId } = req.auth;

      await applicationsServices.deleteApplication({
        applicationId: Number(applicationId),
        userId: Number(userId),
      });

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

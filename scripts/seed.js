import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 시딩 작업을 시작합니다...');

  // 1. 기존 데이터 초기화
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.work.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.challengeApplication.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ 기존 데이터를 삭제했습니다.');

  // 2. 비밀번호 해싱
  const hashedPassword = await bcrypt.hash('password1234', SALT_ROUNDS);

  // 3. 유저 생성 (User) - 총 7명
  const _adminUser = await prisma.user.create({
    data: {
      email: 'admin@docthru.com',
      nickname: '관리자',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const proUser1 = await prisma.user.create({
    data: {
      email: 'pro1@docthru.com',
      nickname: '번역장인1',
      password: hashedPassword,
      role: 'PRO',
    },
  });
  const proUser2 = await prisma.user.create({
    data: {
      email: 'pro2@docthru.com',
      nickname: '번역장인2',
      password: hashedPassword,
      role: 'PRO',
    },
  });

  const normalUser1 = await prisma.user.create({
    data: {
      email: 'user1@docthru.com',
      nickname: '열정코더1',
      password: hashedPassword,
      role: 'NORMAL',
    },
  });
  const normalUser2 = await prisma.user.create({
    data: {
      email: 'user2@docthru.com',
      nickname: '열정코더2',
      password: hashedPassword,
      role: 'NORMAL',
    },
  });
  const normalUser3 = await prisma.user.create({
    data: {
      email: 'user3@docthru.com',
      nickname: '공부중3',
      password: hashedPassword,
      role: 'NORMAL',
    },
  });
  const normalUser4 = await prisma.user.create({
    data: {
      email: 'user4@docthru.com',
      nickname: '공부중4',
      password: hashedPassword,
      role: 'NORMAL',
    },
  });

  console.log('✅ 유저 생성 완료');

  // 4. 챌린지 신청서 생성 (ChallengeApplication)

  // 4-1. [NEW] 반려된 신청서 (REJECTED)
  await prisma.challengeApplication.create({
    data: {
      creatorId: normalUser3.id,
      title: '개인 일기장 번역하기', // 부적절한 주제 예시
      category: 'Career',
      documentType: 'Blog',
      originalLink: 'https://personal-blog.com/diary/1',
      description: '제 일기를 영어로 번역하고 싶습니다.',
      maxParticipants: 1,
      deadlineAt: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: 'REJECTED', // 반려 상태
      reviewedAt: new Date(),
      adminFeedback: '공적인 기술 문서나 블로그가 아니므로 반려합니다.', // 관리자 피드백
    },
  });

  // 4-2. 승인 대기 중인 신청서 (2개)
  await prisma.challengeApplication.createMany({
    data: [
      {
        creatorId: normalUser1.id,
        title: 'React 19 공식문서 번역 챌린지',
        category: 'Web',
        documentType: 'Official',
        originalLink:
          'https://react.dev/blog/2024/04/25/react-19-upgrade-guide',
        description:
          'React 19 변경점에 대해 같이 번역하며 공부하실 분 모집합니다.',
        maxParticipants: 5,
        deadlineAt: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'PENDING',
      },
      {
        creatorId: normalUser2.id,
        title: 'Vue.js 3 Composition API 정복',
        category: 'Modern JS',
        documentType: 'Official',
        originalLink: 'https://vuejs.org/guide/introduction.html',
        description: 'Vue 3의 새로운 문법을 완벽하게 이해해봅시다.',
        maxParticipants: 4,
        deadlineAt: new Date(new Date().setDate(new Date().getDate() + 10)),
        status: 'PENDING',
      },
    ],
  });

  // 4-3. 승인 완료된 신청서 (2개)
  // [MODIFIED] 첫 번째 신청서는 마감된 챌린지용 (마감일을 어제로 설정)
  const approvedApp1 = await prisma.challengeApplication.create({
    data: {
      creatorId: proUser1.id,
      title: 'Next.js App Router 딥다이브',
      category: 'Next.js',
      documentType: 'Blog',
      originalLink:
        'https://nextjs.org/docs/app/building-your-application/routing',
      description: 'App Router의 핵심 개념을 완벽하게 번역하고 정리합니다.',
      maxParticipants: 3,
      deadlineAt: new Date(new Date().setDate(new Date().getDate() - 1)), // 어제 마감됨
      status: 'APPROVED',
      reviewedAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5일 전 승인
    },
  });

  const approvedApp2 = await prisma.challengeApplication.create({
    data: {
      creatorId: proUser2.id,
      title: 'TypeScript 5.0 핸드북 스터디',
      category: 'Web',
      documentType: 'Official',
      originalLink:
        'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html',
      description: '타입스크립트 5.0의 데코레이터와 새로운 기능을 번역합니다.',
      maxParticipants: 5,
      deadlineAt: new Date(new Date().setDate(new Date().getDate() + 20)),
      status: 'APPROVED',
      reviewedAt: new Date(),
    },
  });

  console.log('✅ 챌린지 신청서 생성 완료 (반려: 1, 대기: 2, 승인: 2)');

  // 5. 챌린지 생성 (Challenge)
  // [MODIFIED] challenge1을 마감(CLOSED) 상태로 설정
  const challenge1 = await prisma.challenge.create({
    data: {
      applicationId: approvedApp1.id,
      creatorId: proUser1.id,
      title: approvedApp1.title,
      category: approvedApp1.category,
      documentType: approvedApp1.documentType,
      originalLink: approvedApp1.originalLink,
      description: approvedApp1.description,
      maxParticipants: approvedApp1.maxParticipants,
      deadlineAt: approvedApp1.deadlineAt, // 어제 날짜
      status: 'CLOSED', // 마감 상태
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      applicationId: approvedApp2.id,
      creatorId: proUser2.id,
      title: approvedApp2.title,
      category: approvedApp2.category,
      documentType: approvedApp2.documentType,
      originalLink: approvedApp2.originalLink,
      description: approvedApp2.description,
      maxParticipants: approvedApp2.maxParticipants,
      deadlineAt: approvedApp2.deadlineAt,
      status: 'RECRUITING', // 모집 중 상태
    },
  });

  console.log('✅ 챌린지 2개 생성 완료 (마감: 1, 모집중: 1)');

  // 6. 작업물 제출 (Work)
  const work1 = await prisma.work.create({
    data: {
      challengeId: challenge1.id,
      workerId: normalUser1.id,
      content:
        '## Next.js Routing\n\nNext.js의 라우팅 시스템은 파일 시스템 기반입니다...',
      likeCount: 2,
      isSelected: true, //마감된 챌린지의 1등 작업물
    },
  });

  const work2 = await prisma.work.create({
    data: {
      challengeId: challenge1.id,
      workerId: normalUser2.id,
      content:
        '## 페이지와 레이아웃\n\nNext.js 13부터 도입된 App Directory의 핵심은...',
      likeCount: 1,
    },
  });

  const work3 = await prisma.work.create({
    data: {
      challengeId: challenge2.id,
      workerId: normalUser3.id,
      content:
        '## Decorators\n\n타입스크립트 5.0에서 데코레이터가 표준에 맞춰 변경되었습니다.',
      likeCount: 1,
    },
  });

  const _work4 = await prisma.work.create({
    data: {
      challengeId: challenge2.id,
      workerId: normalUser4.id,
      content:
        '## Const Type Parameters\n\nconst 제네릭 타입 파라미터에 대한 설명입니다.',
      likeCount: 0,
    },
  });

  console.log('✅ 작업물 4개 생성 완료');

  // 7. 댓글 생성 (Comment)
  await prisma.comment.createMany({
    data: [
      {
        workId: work1.id,
        authorId: proUser1.id,
        content: '번역 퀄리티가 아주 좋습니다!',
      },
      {
        workId: work1.id,
        authorId: normalUser3.id,
        content: '이 부분은 이렇게 해석하는 게 더 자연스럽지 않을까요?',
      },
      {
        workId: work2.id,
        authorId: proUser2.id,
        content: '수고하셨습니다. 레이아웃 부분이 잘 정리되었네요.',
      },
      {
        workId: work3.id,
        authorId: normalUser1.id,
        content: '데코레이터 변경점이 많아서 어렵네요 ㅠㅠ 잘 봤습니다.',
      },
    ],
  });

  console.log('✅ 댓글 4개 생성 완료');

  // 8. 좋아요 생성 (Like)
  await prisma.like.createMany({
    data: [
      { workId: work1.id, userId: proUser2.id },
      { workId: work1.id, userId: normalUser4.id },
      { workId: work2.id, userId: normalUser1.id },
      { workId: work3.id, userId: proUser1.id },
    ],
  });

  console.log('✅ 좋아요 4개 생성 완료');

  // 9. 알림 생성 (Notification)
  await prisma.notification.createMany({
    data: [
      {
        userId: proUser1.id,
        message:
          '신청하신 "Next.js App Router 딥다이브" 챌린지가 승인되었습니다.',
      },
      {
        userId: proUser1.id,
        message: '새로운 작업물이 제출되었습니다.',
      },
      {
        userId: normalUser1.id,
        message: '제출하신 작업물에 좋아요가 달렸습니다.',
      },
      {
        userId: normalUser3.id,
        message: '신청하신 "개인 일기장 번역하기" 챌린지가 반려되었습니다.',
      },
    ],
  });

  console.log('✅ 알림 4개 생성 완료');
  console.log('🎉 모든 시딩 데이터가 성공적으로 들어갔습니다!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

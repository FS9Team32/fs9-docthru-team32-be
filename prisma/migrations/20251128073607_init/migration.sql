-- CreateEnum
CREATE TYPE "Role" AS ENUM ('NORMAL', 'PRO', 'ADMIN');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('UNAPPROVED', 'RECRUITING', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "original_link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'UNAPPROVED',
    "adminStatus" "AdminStatus" NOT NULL DEFAULT 'PENDING',
    "adminDescription" TEXT NOT NULL,
    "max_participants" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "deadline_at" TIMESTAMP(3),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "work_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_likes" (
    "work_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_likes_pkey" PRIMARY KEY ("work_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "challenges_status_idx" ON "challenges"("status");

-- CreateIndex
CREATE INDEX "works_challenge_id_idx" ON "works"("challenge_id");

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_likes" ADD CONSTRAINT "work_likes_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_likes" ADD CONSTRAINT "work_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

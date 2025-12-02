/*
  Warnings:

  - You are about to drop the column `adminDescription` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `adminStatus` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `challenges` table. All the data in the column will be lost.
  - The `status` column on the `challenges` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `work_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[application_id]` on the table `challenges` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[work_id,user_id]` on the table `work_likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challenge_id,worker_id]` on the table `works` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `application_id` to the `challenges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `challenges` table without a default value. This is not possible if the table is not empty.
  - Made the column `deadline_at` on table `challenges` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `works` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "challenges" DROP CONSTRAINT "challenges_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "work_likes" DROP CONSTRAINT "work_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "works" DROP CONSTRAINT "works_worker_id_fkey";

-- AlterTable
ALTER TABLE "challenges" DROP COLUMN "adminDescription",
DROP COLUMN "adminStatus",
DROP COLUMN "approved_at",
ADD COLUMN     "application_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'RECRUITING',
ALTER COLUMN "max_participants" SET DEFAULT 1,
ALTER COLUMN "deadline_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "work_likes" DROP CONSTRAINT "work_likes_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "work_likes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "works" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "AdminStatus";

-- DropEnum
DROP TYPE "ChallengeStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "challenge_applications" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "original_link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "max_participants" INTEGER NOT NULL DEFAULT 1,
    "deadline_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "admin_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "challenge_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_applications_status_idx" ON "challenge_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_application_id_key" ON "challenges"("application_id");

-- CreateIndex
CREATE INDEX "challenges_status_idx" ON "challenges"("status");

-- CreateIndex
CREATE UNIQUE INDEX "work_likes_work_id_user_id_key" ON "work_likes"("work_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "works_challenge_id_worker_id_key" ON "works"("challenge_id", "worker_id");

-- AddForeignKey
ALTER TABLE "challenge_applications" ADD CONSTRAINT "challenge_applications_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "challenge_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_likes" ADD CONSTRAINT "work_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

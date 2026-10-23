/*
  Warnings:

  - You are about to drop the column `showLatestPost` on the `fc_settings` table. All the data in the column will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."fc_settings" DROP COLUMN "showLatestPost";

-- DropTable
DROP TABLE "public"."posts";

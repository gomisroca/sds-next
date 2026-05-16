/*
  Warnings:

  - You are about to drop the column `templateId` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."events" DROP COLUMN "templateId",
ADD COLUMN     "templateName" TEXT;

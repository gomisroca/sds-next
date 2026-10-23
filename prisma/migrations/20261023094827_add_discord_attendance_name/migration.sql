/*
  Warnings:

  - You are about to drop the column `userId` on the `event_attendances` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."event_attendances" DROP CONSTRAINT "event_attendances_userId_fkey";

-- AlterTable
ALTER TABLE "public"."event_attendances" DROP COLUMN "userId",
ADD COLUMN     "discordName" TEXT;

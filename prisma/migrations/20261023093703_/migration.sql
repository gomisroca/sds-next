/*
  Warnings:

  - A unique constraint covering the columns `[eventId,discordId]` on the table `event_attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discordId` to the `event_attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."event_attendances" DROP CONSTRAINT "event_attendances_userId_fkey";

-- DropIndex
DROP INDEX "public"."event_attendances_eventId_userId_key";

-- AlterTable
ALTER TABLE "public"."event_attendances" ADD COLUMN     "discordId" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_eventId_discordId_key" ON "public"."event_attendances"("eventId", "discordId");

-- AddForeignKey
ALTER TABLE "public"."event_attendances" ADD CONSTRAINT "event_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

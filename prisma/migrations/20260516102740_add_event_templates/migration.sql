-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "startsAt" DROP NOT NULL;

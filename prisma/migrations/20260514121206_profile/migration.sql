-- CreateEnum
CREATE TYPE "public"."Job" AS ENUM ('PLD', 'WAR', 'DRK', 'GNB', 'WHM', 'SCH', 'AST', 'SGE', 'MNK', 'DRG', 'NIN', 'SAM', 'RPR', 'VPR', 'BRD', 'MCH', 'DNC', 'BLM', 'SMN', 'RDM', 'PCT', 'BLU', 'CRP', 'BSM', 'ARM', 'GSM', 'LTW', 'WVR', 'ALC', 'CUL', 'MIN', 'BTN', 'FSH');

-- CreateEnum
CREATE TYPE "public"."Activity" AS ENUM ('RAIDING', 'SAVAGE', 'ULTIMATE', 'EXTREME_TRIALS', 'DUNGEONS', 'ALLIANCE_RAIDS', 'DEEP_DUNGEONS', 'VARIANT_DUNGEONS', 'CRITERION_DUNGEONS', 'PVP', 'FRONTLINE', 'CRYSTALLINE_CONFLICT', 'RIVAL_WINGS', 'HUNTS', 'FATES', 'BLUE_MAGE', 'ROLEPLAY', 'VENUES', 'COMMUNITY_EVENTS', 'FC_EVENTS', 'SOCIALIZING', 'GPOSE', 'MSQ', 'SIDE_QUESTS', 'TREASURE_MAPS', 'ACHIEVEMENTS', 'COLLECTION', 'CRAFTING', 'GATHERING', 'FISHING', 'MARKETBOARD', 'GOLD_SAUCER', 'TRIPLE_TRIAD', 'MAHJONG', 'CHOCOBO_RACING', 'HOUSING', 'ISLAND_SANCTUARY', 'MENTORING', 'ROULETTES', 'GLAMOUR');

-- CreateEnum
CREATE TYPE "public"."Playstyle" AS ENUM ('CASUAL', 'MIDCORE', 'HARDCORE', 'ROLEPLAYER', 'SOCIAL', 'COLLECTOR');

-- CreateTable
CREATE TABLE "public"."profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "portrait" TEXT,
    "banner" TEXT,
    "job" "public"."Job" NOT NULL,
    "activities" "public"."Activity"[],
    "playstyle" "public"."Playstyle" NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "public"."profile"("userId");

-- AddForeignKey
ALTER TABLE "public"."profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

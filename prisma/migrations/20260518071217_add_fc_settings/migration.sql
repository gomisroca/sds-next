-- CreateTable
CREATE TABLE "public"."fc_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "fcName" TEXT NOT NULL DEFAULT 'Sleeping Dragons',
    "subtitle" TEXT NOT NULL DEFAULT 'EU · Light · Phoenix',
    "welcomeTitle" TEXT NOT NULL DEFAULT 'Welcome, Warrior of Light',
    "welcomeText" TEXT NOT NULL DEFAULT 'Sleeping Dragons is a friendly home for adventurers of all kinds — whether you''re here to clear savage tier, tend your garden, or simply share a glass of Ul''dahn wine by the hearth. Pull up a chair.',
    "discordInvite" TEXT,
    "eventChannelId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fc_settings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."fc_settings" ADD COLUMN     "showLatestPost" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "public"."posts"("slug");

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

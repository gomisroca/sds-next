import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { auth } from '@/server/auth';

const f = createUploadthing();

async function verifyRequest() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user?.id) throw new UploadThingError('Unauthorized');
  return { userId: session.user.id };
}

export const UploadThingRouter = {
  eventBanner: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  profileBanner: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  profilePortrait: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadThingRouter = typeof UploadThingRouter;

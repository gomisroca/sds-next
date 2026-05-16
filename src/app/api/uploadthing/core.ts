import { createUploadthing, type FileRouter, UTFiles } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { auth } from '@/server/auth';
import { renameFile } from '@/utils/uploadthing';

const f = createUploadthing();

async function verifyRequest() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user?.id) throw new UploadThingError('Unauthorized');
  return { userId: session.user.id };
}

export const UploadThingRouter = {
  eventBanner: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ files }) => {
      const metadata = await verifyRequest();
      const fileOverrides = files.map((file) => {
        return { ...file, name: renameFile(file) };
      });
      return { ...metadata, [UTFiles]: fileOverrides };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  profileBanner: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ files }) => {
      const metadata = await verifyRequest();
      const fileOverrides = files.map((file) => {
        return { ...file, name: renameFile(file) };
      });
      return { ...metadata, [UTFiles]: fileOverrides };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  profilePortrait: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ files }) => {
      const metadata = await verifyRequest();
      const fileOverrides = files.map((file) => {
        return { ...file, name: renameFile(file) };
      });
      return { ...metadata, [UTFiles]: fileOverrides };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadThingRouter = typeof UploadThingRouter;

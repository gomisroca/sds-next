import { generateReactHelpers, generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import { v4 as uuidv4 } from 'uuid';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<UploadThingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadThingRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadThingRouter>();

export function renameFiles(files: File[]) {
  return files.map((file) => {
    const ext = file.name.split('.').pop();
    const newFileName = `${uuidv4()}.${ext}`;
    return new File([file], newFileName, { type: file.type });
  });
}

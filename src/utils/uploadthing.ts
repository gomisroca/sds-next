import { generateReactHelpers, generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import { type FileUploadData } from 'uploadthing/types';
import { v4 as uuidv4 } from 'uuid';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<UploadThingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadThingRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadThingRouter>();

export function renameFile(file: FileUploadData) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  return `${uuidv4()}.${ext}`;
}

import type { ReadStream } from 'fs';
import { FileExtension, fromStream } from 'file-type';
import { UnsupportedFileTypeError } from './errors';

const SUPPORTED_FILE_EXTENSIONS: FileExtension[] = ['mkv'];

export const checkFileType = async (stream: ReadStream): Promise<void> => {
  const fileType = await fromStream(stream);
  if (!fileType?.ext || !SUPPORTED_FILE_EXTENSIONS.includes(fileType.ext)) {
    throw new UnsupportedFileTypeError();
  }
};

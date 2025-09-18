// src/files/dto/file-response.dto.ts

export class FileResponseDto {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  duration?: number;
  resourceType: string;
}

export class MultipleFilesResponseDto {
  files: FileResponseDto[];
}

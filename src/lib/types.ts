export interface TagRefDto {
  id: string;
  name: string;
}

export interface PhotoDto {
  id: string;
  relPath: string;
  filename: string;
  size: number;
  mtimeMs: number;
  width: number | null;
  height: number | null;
  thumbStatus: "PENDING" | "READY" | "FAILED";
  deletedAt: string | null;
  originalRelPath: string | null;
  title: string | null;
  caption: string | null;
  takenAt: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  tags: TagRefDto[];
}

export interface TagDto {
  id: string;
  name: string;
  createdAt: string;
  mergedFromIds: string | null;
  photoCount?: number;
}

export interface SettingsDto {
  id: number;
  rootPath: string;
  updatedAt: string;
}

export interface BulkOpResultDto {
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

export const TRASH_DIR_NAME = ".trash";
export const THUMBS_DIR_NAME = ".thumbs";
export const EXCLUDED_DIR_NAMES = new Set([TRASH_DIR_NAME, THUMBS_DIR_NAME]);

export const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
  ".heif",
]);

export const THUMBNAIL_WIDTHS = [240, 480, 960, 1600] as const;
export type ThumbnailWidth = (typeof THUMBNAIL_WIDTHS)[number];

export function isImageFile(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export function mimeTypeFor(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

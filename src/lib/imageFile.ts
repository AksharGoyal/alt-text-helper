export const ACCEPTED_IMAGE_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const MAX_IMAGE_MEGABYTES = MAX_IMAGE_BYTES / (1024 * 1024);

export const validateImage = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPEG, PNG, WebP, AVIF or GIF image.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `That image is larger than ${MAX_IMAGE_MEGABYTES} MB. Please choose a smaller one.`;
  }
  return null;
};

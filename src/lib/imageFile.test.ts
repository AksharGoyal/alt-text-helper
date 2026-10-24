import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, validateImage } from './imageFile';

describe('validateImage', () => {
  it('accepts a supported image within the size limit', () => {
    expect(validateImage(new File(['x'], 'cat.png', { type: 'image/png' }))).toBeNull();
  });

  it.each(['text/plain', 'image/svg+xml', 'image/heic'])('rejects %s', (type) => {
    expect(validateImage(new File(['x'], 'file', { type }))).toMatch(/JPEG, PNG/);
  });

  it('rejects images above the size limit', () => {
    const oversized = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.png', {
      type: 'image/png',
    });
    expect(validateImage(oversized)).toMatch(/larger than 10 MB/);
  });
});

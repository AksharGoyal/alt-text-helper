import { describe, expect, it } from 'vitest';
import { MAX_ALT_TEXT_OPTIONS, toAltText, toAltTexts } from './altText';

describe('toAltText', () => {
  it('capitalizes the first letter and ends with a period', () => {
    expect(toAltText('two cats on a bed')).toBe('Two cats on a bed.');
  });

  it('keeps existing terminal punctuation', () => {
    expect(toAltText('what a view!')).toBe('What a view!');
  });

  it('trims surrounding whitespace', () => {
    expect(toAltText('  a dog  ')).toBe('A dog.');
  });

  it('returns an empty string for blank input', () => {
    expect(toAltText('   ')).toBe('');
  });

  it('is idempotent', () => {
    const once = toAltText('a dog');
    expect(toAltText(once)).toBe(once);
  });
});

describe('toAltTexts', () => {
  it('formats each caption as alt text', () => {
    expect(toAltTexts(['a dog', 'a dog on grass'])).toEqual(['A dog.', 'A dog on grass.']);
  });

  it('drops duplicates that differ only in case or trailing punctuation', () => {
    expect(toAltTexts(['a dog', 'A dog.', 'a dog!'])).toEqual(['A dog.']);
  });

  it('drops blank captions', () => {
    expect(toAltTexts(['  ', '', 'a cat'])).toEqual(['A cat.']);
  });

  it('keeps at most the maximum number of options', () => {
    const captions = Array.from({ length: 8 }, (_, index) => `caption ${index}`);
    expect(toAltTexts(captions)).toHaveLength(MAX_ALT_TEXT_OPTIONS);
  });
});

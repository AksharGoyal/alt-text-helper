export const RECOMMENDED_ALT_LENGTH = 125;

export const MIN_ALT_TEXT_OPTIONS = 3;
export const MAX_ALT_TEXT_OPTIONS = 5;

const dedupeKey = (altText: string) => altText.toLowerCase().replace(/[\s.!?]+$/, '');

export const toAltText = (caption: string): string => {
  const sentence = caption.trim();
  if (!sentence) return sentence;
  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
};

export const toAltTexts = (captions: readonly string[]): string[] => {
  const unique = new Map<string, string>();
  for (const caption of captions) {
    const altText = toAltText(caption);
    const key = dedupeKey(altText);
    if (key && !unique.has(key)) unique.set(key, altText);
  }
  return [...unique.values()].slice(0, MAX_ALT_TEXT_OPTIONS);
};

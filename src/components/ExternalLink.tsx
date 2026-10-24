import type { ComponentProps } from 'react';

export const ExternalLink = (props: ComponentProps<'a'>) => (
  <a target="_blank" rel="noopener noreferrer" {...props} />
);

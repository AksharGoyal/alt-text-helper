import { useId } from 'react';
import { RECOMMENDED_ALT_LENGTH } from '../lib/altText';
import type { CaptionState } from '../hooks/captionReducer';
import { CopyButton } from './CopyButton';

const describeState = (state: CaptionState): string => {
  switch (state.status) {
    case 'idle':
      return 'Your alt text options will appear here.';
    case 'working':
      return state.percent === null
        ? 'Looking at the image…'
        : 'Downloading the model. This only happens once.';
    case 'done':
      return `${state.altTexts.length} alt text options ready.`;
    case 'error':
      return `That didn't work: ${state.message}`;
  }
};

const describeLength = (altText: string): string => {
  const length = `${altText.length} characters`;
  return altText.length > RECOMMENDED_ALT_LENGTH ? `${length}, long for alt text` : length;
};

const optionsOf = (state: CaptionState): string[] =>
  state.status === 'working' || state.status === 'done' ? state.altTexts : [];

export const Suggestion = ({ state }: { state: CaptionState }) => {
  const headingId = useId();
  const options = optionsOf(state);

  return (
    <section className="placard" aria-labelledby={headingId}>
      <h2 id={headingId}>Suggested alt text</h2>
      {state.status === 'working' && (
        <progress aria-label="Progress" max={100} value={state.percent ?? undefined} />
      )}
      <p className="visually-hidden" role="status">
        {describeState(state)}
      </p>
      {options.length > 0 ? (
        <ul className="options">
          {options.map((altText) => (
            <li key={altText}>
              <p className="result">{altText}</p>
              <div className="option-footer">
                <span className="hint">{describeLength(altText)}</span>
                <CopyButton text={altText} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="status-message">{describeState(state)}</p>
      )}
    </section>
  );
};

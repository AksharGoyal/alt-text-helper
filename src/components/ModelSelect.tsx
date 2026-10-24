import { useId } from 'react';
import { MODELS } from '../lib/models';
import { ExternalLink } from './ExternalLink';

type ModelSelectProps = {
  value: string;
  disabled: boolean;
  onChange: (modelId: string) => void;
};

export const ModelSelect = ({ value, disabled, onChange }: ModelSelectProps) => {
  const selectId = useId();
  const hintId = useId();
  const selected = MODELS.find((model) => model.id === value);

  return (
    <div className="field">
      <label htmlFor={selectId}>Model</label>
      <select
        id={selectId}
        value={value}
        disabled={disabled}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
      >
        {MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>
      <p id={hintId} className="hint">
        {selected && (
          <>
            {selected.description}{' '}
            <ExternalLink href={`https://huggingface.co/${selected.id}`}>Model card</ExternalLink>
          </>
        )}
      </p>
    </div>
  );
};

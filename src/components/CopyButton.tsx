import { useEffect, useState } from 'react';

type Feedback = 'idle' | 'copied' | 'failed';

const LABELS: Record<Feedback, string> = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy failed',
};

const FEEDBACK_MS = 1500;

export const CopyButton = ({ text }: { text: string }) => {
  const [feedback, setFeedback] = useState<Feedback>('idle');

  useEffect(() => {
    if (feedback === 'idle') return;
    const timer = setTimeout(() => setFeedback('idle'), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [feedback]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('copied');
    } catch {
      setFeedback('failed');
    }
  };

  return (
    <button type="button" onClick={copy}>
      {LABELS[feedback]}
      <span className="visually-hidden"> alt text: {text}</span>
    </button>
  );
};

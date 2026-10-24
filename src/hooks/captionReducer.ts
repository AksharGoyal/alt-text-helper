import { toAltTexts } from '../lib/altText';
import type { WorkerResponse } from '../worker/messages';

export type CaptionState =
  | { status: 'idle' }
  | { status: 'working'; percent: number | null; altTexts: string[] }
  | { status: 'done'; altTexts: string[] }
  | { status: 'error'; message: string };

export type CaptionAction = WorkerResponse | { type: 'start' } | { type: 'reset' };

export const IDLE_STATE: CaptionState = { status: 'idle' };

const NO_DESCRIPTION_MESSAGE = 'The model returned no description. Try another image.';

export const captionReducer = (state: CaptionState, action: CaptionAction): CaptionState => {
  switch (action.type) {
    case 'start':
      return { status: 'working', percent: null, altTexts: [] };
    case 'reset':
      return IDLE_STATE;
    case 'progress':
      return state.status === 'working' ? { ...state, percent: action.percent } : state;
    case 'candidate':
      return state.status === 'working'
        ? { ...state, altTexts: toAltTexts([...state.altTexts, action.text]) }
        : state;
    case 'done':
      if (state.status !== 'working') return state;
      return state.altTexts.length > 0
        ? { status: 'done', altTexts: state.altTexts }
        : { status: 'error', message: NO_DESCRIPTION_MESSAGE };
    case 'error':
      return { status: 'error', message: action.message };
  }
};

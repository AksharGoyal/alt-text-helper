import { describe, expect, it } from 'vitest';
import {
  captionReducer,
  IDLE_STATE,
  type CaptionAction,
  type CaptionState,
} from './captionReducer';

const run = (actions: CaptionAction[], initial: CaptionState = IDLE_STATE) =>
  actions.reduce(captionReducer, initial);

const candidate = (text: string): CaptionAction => ({ type: 'candidate', requestId: 1, text });

describe('captionReducer', () => {
  it('starts working with no options', () => {
    expect(run([{ type: 'start' }])).toEqual({ status: 'working', percent: null, altTexts: [] });
  });

  it('records download progress while working', () => {
    const state = run([{ type: 'start' }, { type: 'progress', requestId: 1, percent: 40 }]);
    expect(state).toMatchObject({ status: 'working', percent: 40 });
  });

  it('accumulates distinct candidates and drops duplicates', () => {
    const state = run([
      { type: 'start' },
      candidate('two cats'),
      candidate('Two cats.'),
      candidate('two kittens'),
    ]);
    expect(state).toMatchObject({ altTexts: ['Two cats.', 'Two kittens.'] });
  });

  it('finishes with the collected options', () => {
    const state = run([{ type: 'start' }, candidate('a dog'), { type: 'done', requestId: 1 }]);
    expect(state).toEqual({ status: 'done', altTexts: ['A dog.'] });
  });

  it('reports an error when the model produced nothing', () => {
    const state = run([{ type: 'start' }, candidate('  '), { type: 'done', requestId: 1 }]);
    expect(state.status).toBe('error');
  });

  it('ignores late candidates after a reset', () => {
    const state = run([{ type: 'start' }, { type: 'reset' }, candidate('late')]);
    expect(state).toEqual(IDLE_STATE);
  });

  it('surfaces worker errors', () => {
    const state = run([{ type: 'start' }, { type: 'error', requestId: 1, message: 'boom' }]);
    expect(state).toEqual({ status: 'error', message: 'boom' });
  });
});

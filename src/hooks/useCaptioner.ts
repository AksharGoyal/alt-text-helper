import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { WorkerRequest, WorkerResponse } from '../worker/messages';
import { captionReducer, IDLE_STATE } from './captionReducer';

export const useCaptioner = () => {
  const workerRef = useRef<Worker>(null);
  const latestRequestIdRef = useRef(0);
  const [state, dispatch] = useReducer(captionReducer, IDLE_STATE);

  useEffect(() => {
    const worker = new Worker(new URL('../worker/caption.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.addEventListener('message', ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.requestId === latestRequestIdRef.current) dispatch(data);
    });
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const caption = useCallback((imageUrl: string, modelId: string) => {
    const requestId = ++latestRequestIdRef.current;
    dispatch({ type: 'start' });
    workerRef.current?.postMessage({
      type: 'caption',
      requestId,
      imageUrl,
      modelId,
    } satisfies WorkerRequest);
  }, []);

  const reset = useCallback(() => {
    const requestId = ++latestRequestIdRef.current;
    dispatch({ type: 'reset' });
    workerRef.current?.postMessage({ type: 'cancel', requestId } satisfies WorkerRequest);
  }, []);

  return { state, caption, reset };
};

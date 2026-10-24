import { pipeline, type ProgressInfo } from '@huggingface/transformers';
import { MAX_ALT_TEXT_OPTIONS, MIN_ALT_TEXT_OPTIONS, toAltTexts } from '../lib/altText';
import type { WorkerRequest, WorkerResponse } from './messages';

type Download = { loaded: number; total: number };
type Captioner = Awaited<ReturnType<typeof createCaptioner>>;
type CaptionRequest = Extract<WorkerRequest, { type: 'caption' }>;

const BEAM_SEARCH = { num_beams: 4, max_new_tokens: 40 };
const SAMPLING = { do_sample: true, top_k: 50, temperature: 0.9, max_new_tokens: 40 };
const TARGET_PASSES = 6;
const MAX_PASSES = 9;

const optionsForPass = (pass: number) => (pass === 0 ? BEAM_SEARCH : SAMPLING);

let latestRequestId = 0;
let pendingWork: Promise<void> = Promise.resolve();
let activeCaptioner: { modelId: string; captioner: Promise<Captioner> } | undefined;

const postResponse = (response: WorkerResponse) => self.postMessage(response);

const createProgressReporter = () => {
  const downloads = new Map<string, Download>();

  return (info: ProgressInfo) => {
    if (info.status !== 'progress') return;
    downloads.set(info.file, { loaded: info.loaded, total: info.total });
    const { loaded, total } = [...downloads.values()].reduce(
      (sum, file) => ({ loaded: sum.loaded + file.loaded, total: sum.total + file.total }),
      { loaded: 0, total: 0 },
    );
    postResponse({
      type: 'progress',
      requestId: latestRequestId,
      percent: total ? (loaded / total) * 100 : 0,
    });
  };
};

const createCaptioner = (modelId: string) =>
  pipeline('image-to-text', modelId, { progress_callback: createProgressReporter() });

const disposeActiveCaptioner = () =>
  activeCaptioner?.captioner.then((captioner) => captioner.dispose()).catch(() => {});

const loadCaptioner = (modelId: string) => {
  if (activeCaptioner?.modelId !== modelId) {
    void disposeActiveCaptioner();
    const captioner = createCaptioner(modelId);
    activeCaptioner = { modelId, captioner };
    captioner.catch(() => {
      if (activeCaptioner?.captioner === captioner) activeCaptioner = undefined;
    });
  }
  return activeCaptioner.captioner;
};

const describeImage = async (
  captioner: Captioner,
  imageUrl: string,
  options: Record<string, unknown>,
): Promise<string> => {
  const output = await captioner(imageUrl, options);
  const results = Array.isArray(output) ? output : [output];
  return (
    results.flatMap((result) => ('generated_text' in result ? [result.generated_text] : []))[0] ??
    ''
  );
};

const handleCaption = async ({ requestId, imageUrl, modelId }: CaptionRequest) => {
  try {
    const captioner = await loadCaptioner(modelId);
    postResponse({ type: 'progress', requestId, percent: null });

    let altTexts: string[] = [];
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      if (requestId !== latestRequestId) return;
      const text = await describeImage(captioner, imageUrl, optionsForPass(pass));
      altTexts = toAltTexts([...altTexts, text]);
      postResponse({ type: 'candidate', requestId, text });
      if (altTexts.length >= MAX_ALT_TEXT_OPTIONS) break;
      if (pass + 1 >= TARGET_PASSES && altTexts.length >= MIN_ALT_TEXT_OPTIONS) break;
    }
    postResponse({ type: 'done', requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    postResponse({ type: 'error', requestId, message });
  }
};

self.addEventListener('message', ({ data }: MessageEvent<WorkerRequest>) => {
  latestRequestId = data.requestId;
  if (data.type === 'caption') pendingWork = pendingWork.then(() => handleCaption(data));
});

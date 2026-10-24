import {
  AutoModelForVision2Seq,
  AutoProcessor,
  env,
  load_image,
  pipeline,
  Tensor,
  type ProgressInfo,
} from '@huggingface/transformers';
import ortLoaderUrl from 'onnxruntime-web/ort-wasm-simd-threaded.asyncify.mjs?url';
import ortWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.asyncify.wasm?url';
import {
  MAX_ALT_TEXT_OPTIONS,
  MIN_ALT_TEXT_OPTIONS,
  stripMarkdown,
  toAltTexts,
  toFirstSentence,
} from '../lib/altText';
import { MODELS, type ModelOption } from '../lib/models';
import type { WorkerRequest, WorkerResponse } from './messages';

env.backends.onnx.wasm!.wasmPaths = { mjs: ortLoaderUrl, wasm: ortWasmUrl };

type Download = { loaded: number; total: number };
type CaptionRequest = Extract<WorkerRequest, { type: 'caption' }>;
type Describer = {
  describe: (imageUrl: string, pass: number) => Promise<string>;
  dispose: () => Promise<unknown>;
};

const TARGET_PASSES = 6;
const MAX_PASSES = 9;

const VISION_LANGUAGE_PROMPT = 'Describe this image in one short sentence for alt text.';
const VISION_LANGUAGE_DTYPE = {
  embed_tokens: 'q8',
  vision_encoder: 'q8',
  decoder_model_merged: 'q8',
} as const;

const SAMPLING = { do_sample: true, top_k: 50, temperature: 0.9, max_new_tokens: 40 };
const CAPTIONER_BEST = { num_beams: 4, max_new_tokens: 40 };
const VISION_LANGUAGE_BEST = { do_sample: false, max_new_tokens: 60 };
const VISION_LANGUAGE_SAMPLING = {
  do_sample: true,
  top_k: 40,
  temperature: 0.5,
  max_new_tokens: 60,
};

let latestRequestId = 0;
let pendingWork: Promise<void> = Promise.resolve();
let activeDescriber: { modelId: string; describer: Promise<Describer> } | undefined;

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

const createCaptionerDescriber = async (modelId: string): Promise<Describer> => {
  const captioner = await pipeline('image-to-text', modelId, {
    progress_callback: createProgressReporter(),
  });

  return {
    describe: async (imageUrl, pass) => {
      const output = await captioner(imageUrl, pass === 0 ? CAPTIONER_BEST : SAMPLING);
      const results = Array.isArray(output) ? output : [output];
      return (
        results.flatMap((result) =>
          'generated_text' in result ? [result.generated_text] : [],
        )[0] ?? ''
      );
    },
    dispose: () => captioner.dispose(),
  };
};

const createVisionLanguageDescriber = async (modelId: string): Promise<Describer> => {
  const processor = await AutoProcessor.from_pretrained(modelId);
  const model = await AutoModelForVision2Seq.from_pretrained(modelId, {
    dtype: VISION_LANGUAGE_DTYPE,
    progress_callback: createProgressReporter(),
  });
  const prompt = processor.apply_chat_template(
    [
      {
        role: 'user',
        content: [{ type: 'image' }, { type: 'text', text: VISION_LANGUAGE_PROMPT }],
      },
    ],
    { add_generation_prompt: true },
  );

  let prepared: { imageUrl: string; inputs: Awaited<ReturnType<typeof processor>> } | undefined;

  const prepareInputs = async (imageUrl: string) => {
    if (prepared?.imageUrl !== imageUrl) {
      const image = await load_image(imageUrl);
      prepared = {
        imageUrl,
        inputs: await processor(prompt, [image], { do_image_splitting: false }),
      };
    }
    return prepared.inputs;
  };

  return {
    describe: async (imageUrl, pass) => {
      const inputs = await prepareInputs(imageUrl);
      const generated = await model.generate({
        ...inputs,
        ...(pass === 0 ? VISION_LANGUAGE_BEST : VISION_LANGUAGE_SAMPLING),
      });
      if (!(generated instanceof Tensor)) throw new Error('The model returned no token ids');
      const [text = ''] = processor.batch_decode(
        generated.slice(null, [inputs.input_ids.dims.at(-1), null]),
        { skip_special_tokens: true },
      );
      return toFirstSentence(stripMarkdown(text));
    },
    dispose: () => model.dispose(),
  };
};

const findModel = (modelId: string): ModelOption => {
  const model = MODELS.find(({ id }) => id === modelId);
  if (!model) throw new Error(`Unknown model: ${modelId}`);
  return model;
};

const createDescriber = ({ id, kind }: ModelOption): Promise<Describer> =>
  kind === 'vision-language' ? createVisionLanguageDescriber(id) : createCaptionerDescriber(id);

const disposeActiveDescriber = () =>
  activeDescriber?.describer.then((describer) => describer.dispose()).catch(() => {});

const loadDescriber = (modelId: string) => {
  if (activeDescriber?.modelId !== modelId) {
    const model = findModel(modelId);
    void disposeActiveDescriber();
    const describer = createDescriber(model);
    activeDescriber = { modelId, describer };
    describer.catch(() => {
      if (activeDescriber?.describer === describer) activeDescriber = undefined;
    });
  }
  return activeDescriber.describer;
};

const handleCaption = async ({ requestId, imageUrl, modelId }: CaptionRequest) => {
  try {
    const describer = await loadDescriber(modelId);
    postResponse({ type: 'progress', requestId, percent: null });

    let altTexts: string[] = [];
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      if (requestId !== latestRequestId) return;
      const text = await describer.describe(imageUrl, pass);
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

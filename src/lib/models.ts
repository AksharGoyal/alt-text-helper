export type ModelKind = 'captioner' | 'vision-language';

export type ModelOption = {
  id: string;
  label: string;
  kind: ModelKind;
  description: string;
};

export const MODELS = [
  {
    id: 'Mozilla/distilvit',
    label: 'DistilViT by Mozilla',
    kind: 'captioner',
    description: 'Fine-tuned on alt text data. Smaller download, about 190 MB.',
  },
  {
    id: 'Xenova/vit-gpt2-image-captioning',
    label: 'ViT-GPT2',
    kind: 'captioner',
    description: 'General-purpose captioner. About 245 MB to download.',
  },
  {
    id: 'HuggingFaceTB/SmolVLM-256M-Instruct',
    label: 'SmolVLM 256M',
    kind: 'vision-language',
    description: 'Vision-language model that notices more detail. About 264 MB to download.',
  },
  {
    id: 'HuggingFaceTB/SmolVLM-500M-Instruct',
    label: 'SmolVLM 500M',
    kind: 'vision-language',
    description: 'Most detailed and slowest. May invent details. About 516 MB to download.',
  },
] as const satisfies readonly ModelOption[];

export const DEFAULT_MODEL_ID: string = MODELS[0].id;

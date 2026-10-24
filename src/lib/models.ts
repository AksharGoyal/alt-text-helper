export type ModelOption = { id: string; label: string; description: string };

export const MODELS = [
  {
    id: 'Mozilla/distilvit',
    label: 'DistilViT by Mozilla',
    description: 'Fine-tuned on alt text data. Smaller download, about 190 MB.',
  },
  {
    id: 'Xenova/vit-gpt2-image-captioning',
    label: 'ViT-GPT2',
    description: 'General-purpose captioner. About 245 MB to download.',
  },
] as const satisfies readonly ModelOption[];

export const DEFAULT_MODEL_ID: string = MODELS[0].id;

export type WorkerRequest =
  | { type: 'caption'; requestId: number; imageUrl: string; modelId: string }
  | { type: 'cancel'; requestId: number };

export type WorkerResponse =
  | { type: 'progress'; requestId: number; percent: number | null }
  | { type: 'candidate'; requestId: number; text: string }
  | { type: 'done'; requestId: number }
  | { type: 'error'; requestId: number; message: string };

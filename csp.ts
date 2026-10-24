const MODEL_HOSTS = ['https://huggingface.co', 'https://*.huggingface.co', 'https://*.hf.co'];

const directives: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", 'blob:', "'wasm-unsafe-eval'"],
  'connect-src': ["'self'", 'blob:', ...MODEL_HOSTS],
  'worker-src': ["'self'", 'blob:'],
  'img-src': ["'self'", 'blob:', 'data:'],
  'base-uri': ["'none'"],
  'form-action': ["'none'"],
  'frame-ancestors': ["'none'"],
};

export const contentSecurityPolicy = Object.entries(directives)
  .map(([name, sources]) => `${name} ${sources.join(' ')}`)
  .join('; ');

import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { contentSecurityPolicy } from './csp.ts';

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const emitHeadersFile = (): Plugin => ({
  name: 'emit-headers-file',
  generateBundle() {
    const rules = Object.entries(securityHeaders).map(([name, value]) => `  ${name}: ${value}`);
    this.emitFile({
      type: 'asset',
      fileName: '_headers',
      source: ['/*', ...rules, ''].join('\n'),
    });
  },
});

export default defineConfig({
  plugins: [react(), emitHeadersFile()],
  worker: { format: 'es' },
  preview: { headers: securityHeaders },
  test: { environment: 'node' },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // This is the fix
    environment: 'node',
  },
});
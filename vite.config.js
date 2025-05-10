import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    loader: 'jsx' // Make sure "loader" is a string, not an object
  }
});

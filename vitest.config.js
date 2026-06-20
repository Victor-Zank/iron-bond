import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Load environment variables from .env so tests can read SUPABASE_* values.
dotenv.config();

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.{js,ts}'],
    // keep setupFiles as a fallback for other setups
    setupFiles: ['dotenv/config'],
    hookTimeout: 120000,
  },
});

// eslint.config.ts
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

// Note: In Node.js environments, you need to have 'jiti' installed to use a .ts config file.

export default defineConfig([
  // Apply recommended ESLint rules to all files
  eslint.configs.recommended,

  // Apply recommended TypeScript-ESLint rules
  ...tseslint.configs.recommendedTypeChecked,
  
  // Apply additional stylistic type-checked rules (optional, consider 'strictTypeChecked' if preferred)
  ...tseslint.configs.stylisticTypeChecked,

  {
    // Target TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'], // Specify your tsconfig.json path
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Add custom rule overrides here
      '@typescript-eslint/no-explicit-any': 'warn',
      // Example of overriding a base rule
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  {
    // Ignore patterns for global configuration
    ignores: ['dist', 'build', '**/*.js'],
  }
]);

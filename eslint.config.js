// eslint.config.js — Expo SDK 57 + TypeScript strict + React 19.
// Flat config for ESLint v9. Built on top of eslint-config-expo's flat preset.

const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'android/**',
      'ios/**',
      'web-build/**',
      // Generated / vendor metadata.
      'pnpm-lock.yaml',
      // OpenSpec tooling owns these files; do not lint.
      'openspec/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Project convention: no barrels in src/ or shared/ui/.
      // The rule is scoped to barrel candidate paths; elsewhere `export *` is fine
      // (e.g. for index files outside src/).
      'no-restricted-syntax': 'off',
    },
  },
  // Block barrel files (ExportAllDeclaration / re-exports) in any src/features or
  // src/shared/ui index file. RFC-001 + openspec/config.yaml → "Imports — no barrels".
  {
    files: ['src/features/**/index.{ts,tsx,js,jsx}', 'src/shared/ui/**/index.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            'Barrel files are forbidden under src/features/ and src/shared/ui/. Import by concrete path instead. See openspec/config.yaml → "Imports — no barrels".',
        },
        {
          selector: 'ExportNamedDeclaration[source]',
          message:
            'Re-exports are forbidden in barrel files under src/features/ and src/shared/ui/. Import by concrete path instead. See openspec/config.yaml → "Imports — no barrels".',
        },
      ],
    },
  },
]);

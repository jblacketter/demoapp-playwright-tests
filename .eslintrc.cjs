module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'playwright'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:playwright/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // TypeScript strict rules
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-member-accessibility': ['error', {
      accessibility: 'explicit',
      overrides: {
        constructors: 'no-public',
      },
    }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'off',

    // General code quality
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],

    // Playwright specific
    'playwright/no-focused-test': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/valid-expect': 'error',
    // Disable expect-expect as assertions are in page objects (POM pattern)
    'playwright/expect-expect': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'playwright-report/', 'test-results/'],
};

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'src/data/*.json'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      ...reactRefresh.configs.vite.rules,
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]

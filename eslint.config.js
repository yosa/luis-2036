// Configuración única de ESLint para los tres workspaces.
// Base type-aware (projectService) para que las reglas de Sonar que necesitan
// tipos sí comprueben (una regla type-aware sin tipos queda activa pero muda).
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', '.private/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      // Los manejadores de error de Express necesitan 4 argumentos aunque no usen `next`.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // `todo-tag` dispara con la palabra española «todo» de los comentarios;
      // con comentarios en español no hay configuración que la salve.
      'sonarjs/todo-tag': 'off',
    },
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    files: ['api/**/*.ts', 'shared/**/*.ts', '*.js', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'frontend/cypress/**/*.ts'],
    rules: {
      // En pruebas se usan datos ficticios que parecen secretos (contraseñas, CVV).
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
    },
  },
  {
    files: ['frontend/cypress/**/*.ts'],
    rules: {
      // Las aserciones de Cypress viven dentro de callbacks de `.each()` o
      // encadenadas desde un helper; la regla solo reconoce `expect` directo.
      'sonarjs/assertions-in-tests': 'off',
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
)

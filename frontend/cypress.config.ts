import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Contra el build (vite preview), no contra el dev server: se prueba lo que se despliega.
    baseUrl: 'http://localhost:4173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
  },
})

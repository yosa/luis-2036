/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- así se extienden los comandos de Cypress
  namespace Cypress {
    interface Chainable {
      /** Registra a Ana por la interfaz y deja la sesión abierta en el dashboard. */
      registerAna(): Chainable<void>
    }
  }
}

export const ANA = { fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' }

Cypress.Commands.add('registerAna', () => {
  cy.visit('/register')
  cy.findByLabelText('Nombre completo').type(ANA.fullName)
  cy.findByLabelText('Correo electrónico').type(ANA.email)
  cy.findByLabelText('Contraseña').type(ANA.password)
  cy.findByLabelText('Confirma tu contraseña').type(ANA.password)
  cy.findByRole('button', { name: 'Crear cuenta' }).click()
  cy.findByRole('heading', { name: 'Hola, Ana' }).should('be.visible')
})

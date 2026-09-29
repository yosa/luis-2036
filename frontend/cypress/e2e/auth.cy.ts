import { ANA } from '../support/commands'

describe('mínimos de validez', () => {
  it('registrar → dashboard → cerrar sesión → iniciar sesión → dashboard', () => {
    cy.registerAna()
    cy.location('pathname').should('eq', '/dashboard')
    cy.findByRole('region', { name: 'Saldo disponible' }).should('contain.text', '$0.00')
    cy.findByRole('figure', { name: 'Tus apuestas de hoy' }).should('be.visible')
    cy.findByRole('figure', { name: 'Victorias por caracol' }).should('be.visible')

    cy.findByRole('button', { name: 'Cerrar sesión' }).click()
    cy.findByRole('heading', { name: 'Bienvenido de vuelta' }).should('be.visible')

    cy.findByLabelText('Correo electrónico').type(ANA.email)
    cy.findByLabelText('Contraseña').type(ANA.password)
    cy.findByRole('button', { name: 'Iniciar sesión' }).click()
    cy.findByRole('heading', { name: 'Hola, Ana' }).should('be.visible')
  })

  it('la sesión y el usuario sobreviven a recargar la página', () => {
    cy.registerAna()
    cy.reload()
    cy.findByRole('heading', { name: 'Hola, Ana' }).should('be.visible')
  })

  it('sin sesión, el dashboard redirige al login', () => {
    cy.visit('/dashboard')
    cy.location('pathname').should('eq', '/login')
  })
})

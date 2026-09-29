// Nivel 1 del estándar: la red de SnailPay se intercepta. Determinista y sin depender del API.
const CHARGES = '**/v1/snailpay/charges'

function fillRecharge(cvv = '543') {
  cy.findByLabelText('Nombre en la tarjeta').type('Ana Pérez')
  cy.findByLabelText('Número de tarjeta').type('1234 1234 1234 1234')
  cy.findByLabelText('Vencimiento').type('12/26')
  cy.findByLabelText('CVV').type(cvv)
  cy.findByLabelText('Monto a recargar (MXN)').type('250.50')
  cy.findByRole('button', { name: 'Recargar' }).click()
}

describe('recarga con SnailPay', () => {
  beforeEach(() => {
    cy.registerAna()
    cy.findByRole('link', { name: 'Recargar saldo' }).click()
    cy.location('pathname').should('eq', '/recharge')
  })

  it('aprobada: manda los datos de la sesión y el saldo se actualiza de inmediato', () => {
    cy.fixture('charge-approved.json').then((body: Record<string, unknown>) => {
      cy.intercept('POST', CHARGES, { statusCode: 201, body }).as('charge')
    })

    fillRecharge()

    cy.wait('@charge').its('request.body').should('deep.include', {
      card_number: '1234123412341234',
      expiration: '12/26',
      cvv: '543',
      amount: 250.5,
      payer_email: 'ana@example.com',
    })
    cy.findByRole('status').should('contain.text', 'Recarga aprobada por $250.50.')
    cy.findByLabelText('Saldo $250.50').should('be.visible')

    cy.findByRole('link', { name: '← Volver al dashboard' }).click()
    cy.findByRole('region', { name: 'Saldo disponible' }).should('contain.text', '$250.50')
  })

  it('rechazada: mensaje por status_detail y el saldo no cambia', () => {
    cy.fixture('charge-approved.json').then((approved: Record<string, unknown>) => {
      cy.intercept('POST', CHARGES, {
        statusCode: 402,
        body: {
          ...approved,
          status: 'rejected',
          status_detail: 'cc_rejected_bad_filled_security_code',
          authorization_code: null,
          cvv: '999',
        },
      }).as('charge')
    })

    fillRecharge('999')

    cy.wait('@charge')
    cy.findByRole('alert').should('contain.text', 'El CVV no es correcto.')
    cy.findByLabelText('Saldo $0.00').should('be.visible')
  })

  it('timeout: si SnailPay no responde a tiempo, avisa y no acredita', () => {
    cy.fixture('charge-approved.json').then((body: Record<string, unknown>) => {
      // Llega aprobado, pero después del timeout del cliente (8 s): nunca debe acreditarse.
      cy.intercept('POST', CHARGES, { statusCode: 201, body, delay: 9000 }).as('charge')
    })

    fillRecharge()

    cy.findByRole('button', { name: 'Procesando con SnailPay…' }).should('be.disabled')
    cy.findByRole('status', { timeout: 10_000 }).should(
      'contain.text',
      'No pudimos confirmar la recarga a tiempo.',
    )
    cy.findByLabelText('Saldo $0.00').should('be.visible')
  })
})

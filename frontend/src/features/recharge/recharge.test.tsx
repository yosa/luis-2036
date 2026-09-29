import type { ChargeResponse } from '@snail-race/shared'
import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Constants from '../../constants'
import { walletsSlot } from '../../storage/slots'
import { useSessionStore } from '../../stores/session'
import { renderApp } from '../../test/renderApp'

// Timeout del cliente corto SOLO en esta prueba, para no esperar 8 s.
vi.mock('../../constants', async (importOriginal) => ({
  ...(await importOriginal<typeof Constants>()),
  HTTP_TIMEOUT_MS: 50,
}))

function contractResponse(overrides: Partial<ChargeResponse>): ChargeResponse {
  return {
    id: crypto.randomUUID(),
    status: 'approved',
    status_detail: 'accredited',
    transaction_amount: 250.5,
    currency_id: 'MXN',
    date_created: '2026-09-28T19:54:03.120Z',
    authorization_code: 'A7K2Q9',
    reference: 'SNP-20260928-7K2QF4',
    payer_id: useSessionStore.getState().user?.id ?? null,
    payer_email: 'ana@example.com',
    card_number: '1234123412341234',
    cvv: '543',
    ...overrides,
  }
}

function stubSnailpay(status: number, body: ChargeResponse) {
  const fetchMock = vi.fn(() => Promise.resolve(Response.json(body, { status })))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function fillAndSubmit(user: ReturnType<typeof renderApp>['user'], cvv = '543') {
  await user.type(await screen.findByLabelText('Nombre en la tarjeta'), 'Ana Pérez')
  await user.type(screen.getByLabelText('Número de tarjeta'), '1234 1234 1234 1234')
  await user.type(screen.getByLabelText('Vencimiento'), '12/26')
  await user.type(screen.getByLabelText('CVV'), cvv)
  await user.type(screen.getByLabelText('Monto a recargar (MXN)'), '250.50')
  await user.click(screen.getByRole('button', { name: 'Recargar' }))
}

const balanceInHeader = () => screen.getByLabelText(/^Saldo \$/)
const storedBalance = () =>
  walletsSlot.read()[useSessionStore.getState().user?.id ?? '']?.balanceCents ?? 0

beforeEach(async () => {
  useSessionStore.setState({ user: null })
  await useSessionStore
    .getState()
    .register({ fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('recarga con SnailPay', () => {
  it('aprobada: suma el saldo, lo guarda, lo muestra de inmediato y lo informa', async () => {
    const fetchMock = stubSnailpay(201, contractResponse({}))
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent('Recarga aprobada por $250.50.')
    expect(balanceInHeader()).toHaveTextContent('$250.50')
    expect(storedBalance()).toBe(25_050)
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({
      card_number: '1234123412341234',
      amount: 250.5,
      payer_email: 'ana@example.com',
      payer_id: useSessionStore.getState().user?.id,
    })
  })

  it('rechazada: mensaje comprensible y el saldo NO cambia', async () => {
    stubSnailpay(
      402,
      contractResponse({
        status: 'rejected',
        status_detail: 'cc_rejected_bad_filled_security_code',
        authorization_code: null,
        cvv: '999',
      }),
    )
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user, '999')

    expect(await screen.findByRole('alert')).toHaveTextContent('El CVV no es correcto.')
    expect(balanceInHeader()).toHaveTextContent('$0.00')
    expect(storedBalance()).toBe(0)
  })

  it('error del sistema: no se aplica ninguna recarga', async () => {
    stubSnailpay(
      503,
      contractResponse({
        status: 'error',
        status_detail: 'service_unavailable',
        authorization_code: null,
      }),
    )
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('SnailPay no está disponible')
    expect(storedBalance()).toBe(0)
  })

  it('un 201 que dice "approved" pero con otro monto NO acredita (falso éxito)', async () => {
    stubSnailpay(201, contractResponse({ transaction_amount: 9999 }))
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent('no coincide con lo solicitado')
    expect(storedBalance()).toBe(0)
  })

  it('timeout del cliente: avisa que no se pudo confirmar y no acredita', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('aborted', 'AbortError'))
            })
          }),
      ),
    )
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'No pudimos confirmar la recarga a tiempo.',
    )
    expect(storedBalance()).toBe(0)
  })

  it('sin red: mensaje propio y el saldo no cambia', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    )
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión con SnailPay.')
    expect(storedBalance()).toBe(0)
  })

  it('valida antes de enviar: no llama a SnailPay con datos inválidos', async () => {
    const fetchMock = stubSnailpay(201, contractResponse({}))
    const { user } = renderApp('/recharge')

    await user.type(await screen.findByLabelText('Número de tarjeta'), '1234')
    await user.click(screen.getByRole('button', { name: 'Recargar' }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Nombre en la tarjeta')).toHaveFocus()
  })

  it('el historial muestra la tarjeta enmascarada y nunca el CVV', async () => {
    stubSnailpay(201, contractResponse({}))
    const { user } = renderApp('/recharge')

    await fillAndSubmit(user)
    await screen.findByRole('status')

    const history = screen.getByRole('region', { name: 'Últimos cobros' })
    expect(within(history).getByText(/•••• 1234/)).toBeInTheDocument()
    expect(history).not.toHaveTextContent('543')
    expect(history).not.toHaveTextContent('1234123412341234')
  })
})

describe('acceso a la recarga', () => {
  it('el dashboard tiene el botón "Recargar saldo" que lleva a /recharge', async () => {
    const { user, router } = renderApp('/dashboard')

    await user.click(await screen.findByRole('link', { name: 'Recargar saldo' }))

    expect(router.state.location.pathname).toBe('/recharge')
  })
})

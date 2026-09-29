import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpNetworkError, HttpTimeoutError } from './errors'
import { httpRequest } from './httpRequest'

afterEach(() => {
  vi.unstubAllGlobals()
})

/** fetch que nunca responde, pero que respeta la cancelación como el real. */
function hangingFetch() {
  return vi.fn(
    (_input: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'))
        })
      }),
  )
}

describe('httpRequest', () => {
  it('devuelve status y cuerpo JSON sin interpretarlos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json({ ok: 1 }, { status: 402 }))),
    )

    await expect(httpRequest('/x')).resolves.toEqual({ status: 402, body: { ok: 1 } })
  })

  it('manda JSON con su Content-Type', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json({})))
    vi.stubGlobal('fetch', fetchMock)

    await httpRequest('/charges', { method: 'POST', json: { amount: 1 } })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/charges'),
      expect.objectContaining({
        method: 'POST',
        body: '{"amount":1}',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('un cuerpo que no es JSON se entrega como null, sin lanzar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('<html>502</html>', { status: 502 }))),
    )

    await expect(httpRequest('/x')).resolves.toEqual({ status: 502, body: null })
  })

  it('al vencer el timeout lanza HttpTimeoutError', async () => {
    vi.stubGlobal('fetch', hangingFetch())

    await expect(httpRequest('/lento', { timeoutMs: 20 })).rejects.toBeInstanceOf(HttpTimeoutError)
  })

  it('sin red lanza HttpNetworkError, distinto del timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    )

    await expect(httpRequest('/x')).rejects.toBeInstanceOf(HttpNetworkError)
  })
})

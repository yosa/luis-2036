import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createStorageSlot } from './createStorageSlot'

const slot = createStorageSlot('test:counter', z.object({ count: z.number() }), () => ({
  count: 0,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createStorageSlot', () => {
  it('sin valor guardado devuelve el valor por defecto', () => {
    expect(slot.read()).toEqual({ count: 0 })
  })

  it('escribe y lee de vuelta', () => {
    slot.write({ count: 3 })

    expect(slot.read()).toEqual({ count: 3 })
    expect(localStorage.getItem('test:counter')).toBe('{"count":3}')
  })

  it('un valor que no cumple el esquema vuelve al default y lo avisa, sin lanzar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    localStorage.setItem('test:counter', '{"count":"muchos"}')

    expect(slot.read()).toEqual({ count: 0 })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('storage.corrupted'))
  })

  it('JSON inválido tampoco rompe la lectura', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    localStorage.setItem('test:counter', '{roto')

    expect(slot.read()).toEqual({ count: 0 })
  })

  it('si localStorage lanza, sigue funcionando en memoria', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })

    slot.write({ count: 9 })

    expect(slot.read()).toEqual({ count: 9 })
    slot.remove()
  })
})

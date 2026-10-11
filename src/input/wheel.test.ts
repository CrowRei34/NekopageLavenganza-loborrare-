import { describe, expect, it } from 'vitest'
import { wheelIntent } from './wheel'

describe('wheelIntent', () => {
  it('maps vertical wheel to workspace navigation', () => {
    expect(wheelIntent({ deltaX: 0, deltaY: 20, shiftKey: false })).toEqual({
      axis: 'workspace',
      direction: 'next',
    })
  })

  it('maps horizontal wheel to column navigation', () => {
    expect(wheelIntent({ deltaX: -20, deltaY: 0, shiftKey: false })).toEqual({
      axis: 'column',
      direction: 'previous',
    })
  })

  it('maps shift-wheel to horizontal columns', () => {
    expect(wheelIntent({ deltaX: 0, deltaY: 20, shiftKey: true })).toEqual({
      axis: 'column',
      direction: 'next',
    })
  })
})

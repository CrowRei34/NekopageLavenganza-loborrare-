import { describe, expect, it, vi } from 'vitest'
import { scrollActiveColumnIntoView } from './scrollActiveColumn'

type Bounds = ReturnType<HTMLElement['getBoundingClientRect']>

describe('scrollActiveColumnIntoView', () => {
  it('scrolls only the column strip when the focused column is off-screen', () => {
    const desktop = document.createElement('div')
    const strip = document.createElement('div')
    const active = document.createElement('div')
    desktop.append(strip)
    strip.append(active)
    desktop.scrollTop = 250

    Object.defineProperty(strip, 'clientWidth', { value: 500 })
    vi.spyOn(strip, 'getBoundingClientRect').mockReturnValue({ left: 100 } as Bounds)
    vi.spyOn(active, 'getBoundingClientRect').mockReturnValue({ left: 610, width: 400 } as Bounds)
    const scrollTo = vi.fn()
    strip.scrollTo = scrollTo

    scrollActiveColumnIntoView(strip, active)

    expect(scrollTo).toHaveBeenCalledWith({ left: 410, behavior: 'smooth' })
    expect(desktop.scrollTop).toBe(250)
  })

  it('leaves a fully visible column in place', () => {
    const strip = document.createElement('div')
    const active = document.createElement('div')
    Object.defineProperty(strip, 'clientWidth', { value: 500 })
    vi.spyOn(strip, 'getBoundingClientRect').mockReturnValue({ left: 100 } as Bounds)
    vi.spyOn(active, 'getBoundingClientRect').mockReturnValue({ left: 200, width: 200 } as Bounds)
    const scrollTo = vi.fn()
    strip.scrollTo = scrollTo

    scrollActiveColumnIntoView(strip, active)

    expect(scrollTo).not.toHaveBeenCalled()
  })
})

import type { Direction } from '../core/navigation/commands'

export type WheelIntent =
  { axis: 'workspace'; direction: Direction } | { axis: 'column'; direction: Direction }

export const wheelIntent = (
  event: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'shiftKey'>,
): WheelIntent | null => {
  const horizontal = event.shiftKey ? event.deltaY : event.deltaX
  const vertical = event.shiftKey ? 0 : event.deltaY

  if (Math.abs(horizontal) > Math.abs(vertical) && Math.abs(horizontal) > 0) {
    return {
      axis: 'column',
      direction: horizontal > 0 ? 'next' : 'previous',
    }
  }

  if (Math.abs(vertical) > 0) {
    return {
      axis: 'workspace',
      direction: vertical > 0 ? 'next' : 'previous',
    }
  }

  return null
}

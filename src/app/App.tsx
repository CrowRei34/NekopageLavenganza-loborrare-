import { useEffect, useRef, type WheelEvent as ReactWheelEvent } from 'react'
import type { Direction } from '../core/navigation/commands'
import { TopBar } from '../features/topbar/TopBar'
import { WorkspaceRail } from '../features/workspaces/WorkspaceRail'
import { useNekovoidStore } from '../state/useNekovoidStore'
import { wheelIntent } from '../input/wheel'

const dispatchDirection = (direction: Direction, axis: 'workspace' | 'column') =>
  axis === 'workspace'
    ? ({ type: 'focus-workspace', direction } as const)
    : ({ type: 'focus-column', direction } as const)

export const App = () => {
  const dispatch = useNekovoidStore((state) => state.dispatch)
  const activeWorkspaceId = useNekovoidStore((state) => state.activeWorkspaceId)
  const lastWheelAt = useRef(0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey
      if (!modifier) return

      const direction =
        event.key === 'ArrowDown' || event.key === 'ArrowRight'
          ? 'next'
          : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
            ? 'previous'
            : null
      if (!direction) return

      event.preventDefault()
      dispatch(
        dispatchDirection(
          direction,
          event.key === 'ArrowDown' || event.key === 'ArrowUp' ? 'workspace' : 'column',
        ),
      )
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch])

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('input, textarea, [data-wheel-consumer="true"]')) return

    const intent = wheelIntent(event.nativeEvent)
    if (!intent) return

    const now = performance.now()
    if (now - lastWheelAt.current < 180) return
    lastWheelAt.current = now
    event.preventDefault()
    dispatch(dispatchDirection(intent.direction, intent.axis))
  }

  return (
    <div className="nekovoid" onWheel={onWheel} data-active-workspace={activeWorkspaceId}>
      <TopBar />
      <div className="desktop-surface">
        <div className="desktop-noise" aria-hidden="true" />
        <WorkspaceRail />
      </div>
      <div className="hot-corner" aria-hidden="true" />
    </div>
  )
}

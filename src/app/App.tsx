import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import type { Direction } from '../core/navigation/commands'
import { wallpapers, type WallpaperId } from '../features/wallpaper/catalog'
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
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperId>('original')
  const activeWallpaper =
    wallpapers.find((wallpaper) => wallpaper.id === selectedWallpaper) ?? wallpapers[0]
  const palette = activeWallpaper?.palette
  const themeStyle: CSSProperties | undefined = palette
    ? ({
        '--surface': palette.surface,
        '--surface-variant': palette.surfaceVariant,
        '--foreground': palette.onSurface,
        '--mint': palette.primary,
        '--mint-strong': palette.hover,
        '--ink': palette.onPrimary,
        '--panel': `color-mix(in srgb, ${palette.surfaceVariant} 92%, transparent)`,
        '--panel-solid': palette.surfaceVariant,
        '--line': `color-mix(in srgb, ${palette.outline} 45%, transparent)`,
        '--muted': palette.onSurfaceVariant,
        '--urgent': palette.error,
        '--tui-bg': palette.terminalBackground,
        '--tui-fg': palette.terminalForeground,
        '--tui-muted': palette.onSurfaceVariant,
        '--tui-border': palette.outline,
        '--tui-accent-primary': palette.primary,
        '--tui-accent-secondary': palette.secondary,
        '--tui-error': palette.error,
      } as CSSProperties)
    : undefined

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
    <div
      className="nekovoid"
      onWheel={onWheel}
      data-active-workspace={activeWorkspaceId}
      data-color-scheme={palette?.id}
      style={themeStyle}
    >
      <TopBar selectedWallpaper={selectedWallpaper} onWallpaperSelect={setSelectedWallpaper} />
      <div
        className="desktop-surface"
        style={activeWallpaper ? { backgroundImage: `url("${activeWallpaper.src}")` } : undefined}
      >
        <div className="desktop-noise" aria-hidden="true" />
        <WorkspaceRail />
      </div>
      <div className="hot-corner" aria-hidden="true" />
    </div>
  )
}

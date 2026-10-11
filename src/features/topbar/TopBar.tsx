import { useEffect, useState } from 'react'
import { selectActiveWorkspace } from '../../core/navigation/selectors'
import { useNekovoidStore } from '../../state/useNekovoidStore'
import { BarIcon } from './BarIcon'

const formatTime = () =>
  new Intl.DateTimeFormat('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

export const TopBar = () => {
  const workspaces = useNekovoidStore((state) => state.workspaces)
  const activeWorkspace = useNekovoidStore(selectActiveWorkspace)
  const dispatch = useNekovoidStore((state) => state.dispatch)
  const [currentTime, setCurrentTime] = useState(formatTime)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(formatTime()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar__left">
        <span className="bar-symbol" aria-label="Lanzador">
          <BarIcon name="grid" />
        </span>
        <span className="bar-symbol" aria-label="Ventanas">
          <BarIcon name="window" />
        </span>
        <nav className="workspace-tabs" aria-label="Workspaces">
          {workspaces.map((workspace) => (
            <button
              className={`workspace-tab ${workspace.id === activeWorkspace.id ? 'workspace-tab--active' : ''}`}
              type="button"
              key={workspace.id}
              aria-label={`Workspace ${workspace.number}`}
              aria-current={workspace.id === activeWorkspace.id ? 'true' : undefined}
              onClick={() => dispatch({ type: 'focus-workspace-index', workspaceId: workspace.id })}
            >
              {workspace.number}
            </button>
          ))}
        </nav>
      </div>
      <div className="topbar__center" aria-hidden="true">
        <span />
      </div>
      <div className="topbar__right">
        <button
          className="terminal-trigger"
          type="button"
          aria-label="Abrir terminal"
          title="Abrir terminal"
          onClick={() => dispatch({ type: 'open-terminal' })}
        >
          <BarIcon name="terminal" />
        </button>
        <span className="bar-status bar-status--bell" aria-label="Notificaciones">
          <BarIcon name="bell" />
        </span>
        <span className="bar-status" aria-label="Red">
          <BarIcon name="wifi" />
        </span>
        <span className="bar-status" aria-label="Volumen">
          <BarIcon name="volume" />
        </span>
        <span className="bar-status" aria-label="Batería">
          <BarIcon name="battery" />
        </span>
        <time className="bar-clock" dateTime={currentTime}>
          {currentTime}
        </time>
      </div>
    </header>
  )
}

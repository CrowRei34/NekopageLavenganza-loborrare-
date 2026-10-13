import { useEffect, useRef } from 'react'
import { useNekovoidStore } from '../../state/useNekovoidStore'
import { BarIcon } from '../topbar/BarIcon'

interface WorkspaceIndexProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export const WorkspaceIndex = ({ isOpen, onToggle, onClose }: WorkspaceIndexProps) => {
  const workspaces = useNekovoidStore((state) => state.workspaces)
  const activeWorkspaceId = useNekovoidStore((state) => state.activeWorkspaceId)
  const dispatch = useNekovoidStore((state) => state.dispatch)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<{ focus: () => void } | null>(null)
  const indexedWorkspaces = workspaces.filter((workspace) => !workspace.isEmptyPlaceholder)

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsidePointer = (event: Parameters<typeof window.dispatchEvent>[0]) => {
      if (!rootRef.current?.contains(event.target as HTMLElement)) onClose()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onClose()
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onClose])

  return (
    <div className="workspace-index" ref={rootRef}>
      <button
        className="bar-symbol"
        type="button"
        aria-label="Índice de escritorios"
        aria-expanded={isOpen}
        aria-controls="workspace-index-panel"
        title="Índice de escritorios"
        ref={(element) => {
          triggerRef.current = element
        }}
        onClick={onToggle}
      >
        <BarIcon name="grid" />
      </button>
      {isOpen && (
        <section
          className="workspace-index__panel"
          id="workspace-index-panel"
          aria-label="Índice de escritorios"
          data-wheel-consumer="true"
        >
          <div className="workspace-index__heading">
            <span>ÍNDICE / CONTENIDO</span>
            <span>{String(indexedWorkspaces.length).padStart(2, '0')}</span>
          </div>
          <nav aria-label="Ir a un escritorio">
            <ol className="workspace-index__list">
              {indexedWorkspaces.map((workspace) => {
                const infoWindow = workspace.columns
                  .flatMap((column) => column.windows)
                  .find((window) => window.kind === 'info')
                const isActive = workspace.id === activeWorkspaceId
                const number = String(workspace.number).padStart(2, '0')

                return (
                  <li key={workspace.id}>
                    <button
                      className={`workspace-index__item ${isActive ? 'workspace-index__item--active' : ''}`}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`Ir al escritorio ${number}: ${workspace.name}`}
                      onClick={() => {
                        dispatch({ type: 'focus-workspace-index', workspaceId: workspace.id })
                        onClose()
                        triggerRef.current?.focus()
                      }}
                    >
                      <span className="workspace-index__number">{number}</span>
                      <span className="workspace-index__copy">
                        <strong>{workspace.name}</strong>
                        {infoWindow?.info && <small>{infoWindow.info.title}</small>}
                      </span>
                      {isActive && <span className="workspace-index__active">ACTUAL</span>}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </section>
      )}
    </div>
  )
}

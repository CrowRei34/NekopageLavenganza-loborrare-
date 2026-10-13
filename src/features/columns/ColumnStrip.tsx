import { useEffect, useRef } from 'react'
import { useNekovoidStore } from '../../state/useNekovoidStore'
import type { Workspace } from '../../core/model/types'
import { Column } from './Column'
import { scrollActiveColumnIntoView } from './scrollActiveColumn'

interface ColumnStripProps {
  workspace: Workspace
}

export const ColumnStrip = ({ workspace }: ColumnStripProps) => {
  const stripRef = useRef<HTMLDivElement>(null)
  const dispatch = useNekovoidStore((state) => state.dispatch)

  useEffect(() => {
    const strip = stripRef.current
    if (!workspace.activeColumnId || !strip) return

    const active = strip.querySelector<HTMLElement>(
      `[data-column-id="${workspace.activeColumnId}"]`,
    )
    if (active) scrollActiveColumnIntoView(strip, active)
  }, [workspace.activeColumnId])

  if (workspace.columns.length === 0) {
    return (
      <div className="empty-workspace" aria-label="Workspace vacío">
        <span className="empty-workspace__glyph">∅</span>
        <p>workspace vacío</p>
        <span>Sin ventanas en este workspace</span>
      </div>
    )
  }

  return (
    <div className="column-strip" ref={stripRef} aria-label={`Columnas de ${workspace.name}`}>
      {workspace.columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          active={workspace.activeColumnId === column.id}
          onFocus={() => dispatch({ type: 'focus-column-id', columnId: column.id })}
          onResize={(width) =>
            dispatch({
              type: 'resize-column',
              workspaceId: workspace.id,
              columnId: column.id,
              width,
            })
          }
        />
      ))}
    </div>
  )
}

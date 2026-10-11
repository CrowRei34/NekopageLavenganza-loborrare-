import type { Column as ColumnModel } from '../../core/model/types'
import { TerminalApp } from '../terminal/TerminalApp'

interface ColumnProps {
  column: ColumnModel
  active: boolean
  onFocus: () => void
}

export const Column = ({ column, active, onFocus }: ColumnProps) => (
  <section
    className={`column column--${column.width} ${active ? 'column--active' : ''}`}
    data-column-id={column.id}
    onClick={onFocus}
    aria-label={`Columna ${column.id}`}
  >
    {column.windows.map((window) => {
      if (window.kind === 'terminal') {
        return <TerminalApp key={window.id} windowId={window.id} />
      }

      return (
        <article className="info-window" key={window.id}>
          <span className="info-window__eyebrow">{window.info?.eyebrow}</span>
          <h1>{window.info?.title}</h1>
          <p>{window.info?.body}</p>
          <ul>
            {window.info?.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      )
    })}
  </section>
)

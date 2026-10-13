import type { Column as ColumnModel } from '../../core/model/types'
import { TerminalApp } from '../terminal/TerminalApp'
import { WelcomeResources } from '../welcome/WelcomeResources'

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
        <article
          className={`info-window ${window.info?.showProjectResources ? 'info-window--welcome' : ''}`}
          key={window.id}
        >
          <div className="info-window__copy">
            <span className="info-window__eyebrow">{window.info?.eyebrow}</span>
            <h1>{window.info?.title}</h1>
            <p>{window.info?.body}</p>
            {!!window.info?.bullets.length && (
              <ul>
                {window.info.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
          {!!window.info?.controls?.length && (
            <div className="welcome-controls" role="group" aria-label="Controles de navegación">
              {window.info.controls.map(({ keys, action }) => (
                <div className="welcome-control" key={keys}>
                  <kbd>{keys}</kbd>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          )}
          {window.info?.showProjectResources && <WelcomeResources />}
        </article>
      )
    })}
  </section>
)

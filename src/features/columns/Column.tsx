import { useRef, type PointerEvent, type KeyboardEvent } from 'react'
import type { Column as ColumnModel } from '../../core/model/types'
import { TerminalApp } from '../terminal/TerminalApp'
import { WelcomeResources } from '../welcome/WelcomeResources'

interface ColumnProps {
  column: ColumnModel
  active: boolean
  onFocus: () => void
  onResize: (width: number) => void
}

export const Column = ({ column, active, onFocus, onResize }: ColumnProps) => {
  const resizeRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null)
  const hasTerminal = column.windows.some((window) => window.kind === 'terminal')
  const viewportWidth = window.innerWidth
  const defaultWidth = hasTerminal
    ? viewportWidth <= 640
      ? viewportWidth - 24
      : Math.max(440, Math.min(700, viewportWidth * 0.46))
    : column.width === 'wide'
      ? Math.max(500, Math.min(1060, viewportWidth * 0.69))
      : column.width === 'narrow'
        ? Math.max(340, Math.min(520, viewportWidth * 0.35))
        : Math.max(390, Math.min(900, viewportWidth * 0.5))
  const resizeStartWidth = column.customWidth ?? defaultWidth
  const resizeMax = Math.max(320, window.innerWidth - 32)

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const actualWidth = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 0
    resizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: actualWidth || resizeStartWidth,
    }
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    onFocus()
  }

  const resize = (event: PointerEvent<HTMLDivElement>) => {
    const drag = resizeRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const width = Math.max(320, Math.min(resizeMax, drag.startWidth + event.clientX - drag.startX))
    onResize(width)
  }

  const stopResize = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeRef.current?.pointerId !== event.pointerId) return
    resizeRef.current = null
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const resizeByKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    event.stopPropagation()
    const amount = event.shiftKey ? 100 : 40
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const actualWidth = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 0
    const currentWidth = column.customWidth ?? (actualWidth > 0 ? actualWidth : resizeStartWidth)
    onResize(Math.max(320, Math.min(resizeMax, currentWidth + amount * direction)))
  }

  return (
    <section
      className={`column column--${column.width}${hasTerminal ? ' column--terminal' : ''} ${active ? 'column--active' : ''}`}
      data-column-id={column.id}
      style={column.customWidth ? { flexBasis: `${column.customWidth}px` } : undefined}
      onClick={onFocus}
      aria-label={`Columna ${column.id}`}
    >
      {column.windows.map((window) => {
        if (window.kind === 'terminal') {
          return <TerminalApp key={window.id} windowId={window.id} onFocus={onFocus} />
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
      {hasTerminal && (
        <div
          className="column-resize-handle"
          role="separator"
          aria-label="Redimensionar columna de terminal"
          aria-orientation="vertical"
          aria-valuemin={320}
          aria-valuemax={resizeMax}
          aria-valuenow={column.customWidth ?? Math.round(resizeStartWidth)}
          tabIndex={0}
          onPointerDown={startResize}
          onPointerMove={resize}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
          onKeyDown={resizeByKeyboard}
        />
      )}
    </section>
  )
}

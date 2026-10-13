import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { selectActiveWorkspace } from '../../core/navigation/selectors'
import type { TerminalSession, WindowId } from '../../core/model/types'
import {
  appendTerminalLines,
  createTerminalSession,
  useNekovoidStore,
} from '../../state/useNekovoidStore'
import { PfetchLogo } from './PfetchLogo'
import { executeTerminalCommand } from './terminalEngine'

interface TerminalAppProps {
  windowId: WindowId
}

const prompt = '[neko-void ~]$'

export const TerminalApp = ({ windowId }: TerminalAppProps) => {
  const [command, setCommand] = useState('')
  const [showPfetch, setShowPfetch] = useState(true)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const session = useNekovoidStore((state) => state.terminalSessions[windowId])
  const setTerminalSession = useNekovoidStore((state) => state.setTerminalSession)
  const workspace = useNekovoidStore(selectActiveWorkspace)
  const activeSession = useMemo<TerminalSession>(
    () => session ?? createTerminalSession(),
    [session],
  )

  useEffect(() => {
    if (!session) setTerminalSession(windowId, activeSession)
  }, [activeSession, session, setTerminalSession, windowId])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [activeSession.lines])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!command.trim()) return
    const result = executeTerminalCommand(command, {
      workspaceNumber: workspace.number,
      workspaceName: workspace.name,
    })
    const inputLine = { kind: 'input' as const, text: command }
    const nextSession = result.clear
      ? { ...activeSession, lines: [], nextLineId: 0 }
      : appendTerminalLines(activeSession, [inputLine, ...result.lines])

    setTerminalSession(windowId, nextSession)
    if (result.clear) setShowPfetch(false)
    setCommand('')
  }

  return (
    <article
      className="terminal-window"
      onClick={(event) => {
        event.stopPropagation()
        inputRef.current?.focus()
      }}
    >
      <div className="terminal-output" data-wheel-consumer="true" ref={outputRef}>
        {showPfetch && (
          <section className="terminal-pfetch" aria-label="Información del sistema">
            <div className="terminal-pfetch__command" aria-hidden="true">
              <span className="terminal-prompt">{prompt}</span>{' '}
              <strong className="terminal-pfetch__command-name">mikufetch</strong>
            </div>
            <PfetchLogo />
            <div className="terminal-pfetch__details">
              <strong>neko-void</strong>
              <span className="terminal-pfetch__rule" />
              <span>
                <b>OS</b> Neko Void Linux
              </span>
              <span>
                <b>WM</b> Niri-inspired
              </span>
              <span>
                <b>Shell</b> neko-shell
              </span>
              <span>
                <b>Workspace</b> {String(workspace.number).padStart(2, '0')} — {workspace.name}
              </span>
            </div>
          </section>
        )}
        {activeSession.lines.map((line) => (
          <div className={`terminal-line terminal-line--${line.kind}`} key={line.id}>
            {line.kind === 'input' && <span className="terminal-prompt">{prompt} </span>}
            {line.text}
          </div>
        ))}
        <form className="terminal-input" onSubmit={submit}>
          <label htmlFor={`terminal-input-${windowId}`}>
            <span className="terminal-prompt">{prompt}</span>
            <input
              ref={inputRef}
              id={`terminal-input-${windowId}`}
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Comando de terminal"
            />
          </label>
        </form>
      </div>
    </article>
  )
}

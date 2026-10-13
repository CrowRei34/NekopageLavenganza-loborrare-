import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { selectActiveWorkspace } from '../../core/navigation/selectors'
import type { TerminalSession, WindowId } from '../../core/model/types'
import {
  appendTerminalLines,
  createTerminalSession,
  useNekovoidStore,
} from '../../state/useNekovoidStore'
import { executeTerminalCommand, type TerminalScreen } from './terminalEngine'
import { TerminalTui } from './TerminalTui'
import { PfetchBlock } from './PfetchBlock'

interface TerminalAppProps {
  windowId: WindowId
  onFocus?: () => void
}

const prompt = '[neko-void ~]$'

export const TerminalApp = ({ windowId, onFocus }: TerminalAppProps) => {
  const [command, setCommand] = useState('')
  const [screen, setScreen] = useState<TerminalScreen | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const session = useNekovoidStore((state) => state.terminalSessions[windowId])
  const setTerminalSession = useNekovoidStore((state) => state.setTerminalSession)
  const dispatch = useNekovoidStore((state) => state.dispatch)
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
      virtualFiles: activeSession.virtualFiles,
    })
    if (result.close) {
      dispatch({ type: 'close-window', windowId })
      return
    }
    const inputLine = { kind: 'input' as const, text: command }
    const nextSession = result.clear
      ? { ...activeSession, lines: [], nextLineId: 0 }
      : appendTerminalLines(activeSession, [inputLine, ...result.lines])

    setTerminalSession(windowId, nextSession)
    if (result.screen) setScreen(result.screen)
    setCommand('')
  }

  const saveVirtualFile = (path: string, content: string) => {
    const normalizedPath = path.startsWith('/')
      ? path
      : path === 'README.md'
        ? '/home/nekovoid/README.md'
        : `/home/nekovoid/${path.replace(/^\.\//, '')}`
    setTerminalSession(windowId, {
      ...activeSession,
      virtualFiles: { ...activeSession.virtualFiles, [normalizedPath]: content },
    })
  }

  return (
    <article
      className="terminal-window"
      onPointerDown={onFocus}
      onFocusCapture={onFocus}
      onClick={(event) => {
        event.stopPropagation()
        onFocus?.()
        if (!(event.target as HTMLElement).closest('.terminal-tui')) inputRef.current?.focus()
      }}
    >
      <div className="terminal-output" data-wheel-consumer="true" ref={outputRef}>
        <PfetchBlock workspace={workspace} showCommand={!screen} compact={!!screen} />
        {screen && (
          <TerminalTui
            screen={screen}
            onExit={() => {
              setScreen(null)
              window.setTimeout(() => inputRef.current?.focus(), 0)
            }}
            onSave={saveVirtualFile}
          />
        )}
        {!screen && (
          <>
            {activeSession.lines.map((line) =>
              line.kind === 'fetch' ? (
                <PfetchBlock key={line.id} workspace={workspace} showCommand={false} inline />
              ) : (
                <div className={`terminal-line terminal-line--${line.kind}`} key={line.id}>
                  {line.kind === 'input' && <span className="terminal-prompt">{prompt} </span>}
                  {line.text}
                </div>
              ),
            )}
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
          </>
        )}
      </div>
    </article>
  )
}

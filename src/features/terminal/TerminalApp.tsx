import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type WheelEvent,
} from 'react'
import { selectActiveWorkspace } from '../../core/navigation/selectors'
import type { TerminalSession, WindowId } from '../../core/model/types'
import {
  appendTerminalLines,
  createTerminalSession,
  useNekovoidStore,
} from '../../state/useNekovoidStore'
import {
  executeTerminalCommand,
  getTerminalFileNames,
  terminalCommandNames,
  type TerminalScreen,
} from './terminalEngine'
import { BatOutput, TerminalTui } from './TerminalTui'
import { PfetchBlock } from './PfetchBlock'

interface TerminalAppProps {
  windowId: WindowId
  onFocus?: () => void
}

const prompt = '[neko-void ~]$'
const terminalScrollSelector =
  '.process-table, .terminal-tui--btop, .btop-processes, .bat-pager, .terminal-output'

const longestSharedPrefix = (values: string[]): string =>
  values.reduce((prefix, value) => {
    let length = 0
    while (length < prefix.length && prefix[length] === value[length]) length += 1
    return prefix.slice(0, length)
  })

export const TerminalApp = ({ windowId, onFocus }: TerminalAppProps) => {
  const [command, setCommand] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [cursorOffset, setCursorOffset] = useState(0)
  const [screen, setScreen] = useState<TerminalScreen | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorMeasureRef = useRef<HTMLElement>(null)
  const wheelRemainderRef = useRef({ element: null as HTMLElement | null, delta: 0, time: 0 })
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

  useLayoutEffect(() => {
    setCursorOffset(cursorMeasureRef.current?.getBoundingClientRect().width ?? 0)
  }, [command, cursorPosition])

  const focusTerminal = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleTerminalWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.deltaY) return
    const target = event.target as HTMLElement
    const scroller = (target.closest(terminalScrollSelector) as HTMLElement | null) ?? event.currentTarget
    if (scroller.scrollHeight <= scroller.clientHeight) return

    event.preventDefault()
    const style = window.getComputedStyle(scroller)
    const fontSize = Number.parseFloat(style.fontSize) || 14
    const rawLineHeight = Number.parseFloat(style.lineHeight)
    const lineHeight = Number.isFinite(rawLineHeight)
      ? rawLineHeight <= 4
        ? rawLineHeight * fontSize
        : rawLineHeight
      : fontSize * 1.4

    if (event.deltaMode === 1) {
      scroller.scrollTop += event.deltaY * lineHeight
      return
    }
    if (event.deltaMode === 2) {
      scroller.scrollTop += Math.sign(event.deltaY) * scroller.clientHeight
      return
    }

    const now = event.timeStamp
    const wheelState = wheelRemainderRef.current
    if (wheelState.element !== scroller || now - wheelState.time > 120) {
      wheelState.element = scroller
      wheelState.delta = 0
    }
    wheelState.time = now
    wheelState.delta += event.deltaY

    const notches = Math.trunc(wheelState.delta / 100)
    if (!notches) return
    wheelState.delta -= notches * 100
    scroller.scrollTop += notches * lineHeight * 3
  }

  const handleCommandKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      if (!isFocused) return
      event.preventDefault()

      const beforeCursor = command.slice(0, cursorPosition)
      const tokenStart = beforeCursor.search(/\S*$/)
      const token = beforeCursor.slice(tokenStart)
      if (!token) return

      const isCommand = command.slice(0, tokenStart).trim().length === 0
      const candidates = (isCommand
        ? [...terminalCommandNames]
        : getTerminalFileNames(activeSession.virtualFiles)
      ).filter((candidate) => candidate.startsWith(token))
      if (candidates.length === 0) return

      const completion = candidates.length === 1 ? candidates[0] : longestSharedPrefix(candidates)
      if (completion === token) return

      const nextCommand = `${command.slice(0, tokenStart)}${completion}${command.slice(cursorPosition)}`
      const nextPosition = tokenStart + completion.length
      setCommand(nextCommand)
      setCursorPosition(nextPosition)
      window.requestAnimationFrame(() => inputRef.current?.setSelectionRange(nextPosition, nextPosition))
      return
    }

    if (!isFocused || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
    event.preventDefault()

    if (event.key === 'ArrowUp') {
      const nextIndex = Math.max(0, historyIndex - 1)
      const nextCommand = history[nextIndex] ?? ''
      setHistoryIndex(nextIndex)
      setCommand(nextCommand)
      setCursorPosition(nextCommand.length)
      return
    }

    const nextIndex = Math.min(history.length, historyIndex + 1)
    const nextCommand = history[nextIndex] ?? ''
    setHistoryIndex(nextIndex)
    setCommand(nextCommand)
    setCursorPosition(nextCommand.length)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!command.trim()) return
    const currentSession =
      useNekovoidStore.getState().terminalSessions[windowId] ?? activeSession
    const result = executeTerminalCommand(command, {
      workspaceNumber: workspace.number,
      workspaceName: workspace.name,
      virtualFiles: currentSession.virtualFiles,
    })
    if (result.close) {
      dispatch({ type: 'close-window', windowId })
      return
    }
    const nextHistory = [...history, command]
    setHistory(nextHistory)
    setHistoryIndex(nextHistory.length)
    const inputLine = { kind: 'input' as const, text: command }
    const hasFileChanges = result.writes?.length || result.deletes?.length
    const nextVirtualFiles = { ...currentSession.virtualFiles }
    for (const write of result.writes ?? []) nextVirtualFiles[write.path] = write.content
    for (const path of result.deletes ?? []) delete nextVirtualFiles[path]
    const sessionWithFileChanges = hasFileChanges
      ? { ...currentSession, virtualFiles: nextVirtualFiles }
      : currentSession
    const nextSession = result.clear
      ? { ...sessionWithFileChanges, lines: [], nextLineId: 0 }
      : appendTerminalLines(sessionWithFileChanges, [inputLine, ...result.lines])

    setTerminalSession(windowId, nextSession)
    if (result.screen) setScreen(result.screen)
    setCommand('')
    setCursorPosition(0)
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
      onPointerDown={focusTerminal}
      onFocusCapture={focusTerminal}
      onBlurCapture={() => setIsFocused(false)}
      onClick={(event) => {
        event.stopPropagation()
        focusTerminal()
        if (!(event.target as HTMLElement).closest('.terminal-tui')) inputRef.current?.focus()
      }}
    >
      <div
        className={`terminal-output${screen ? ' terminal-output--screen' : ''}`}
        data-wheel-consumer="true"
        ref={outputRef}
        onWheel={handleTerminalWheel}
      >
        {!screen && <PfetchBlock workspace={workspace} showCommand compact={false} />}
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
              ) : line.kind === 'bat' ? (
                <BatOutput key={line.id} path={line.path ?? ''} content={line.text} />
              ) : (
                <div className={`terminal-line terminal-line--${line.kind}`} key={line.id}>
                  {line.kind === 'input' && <span className="terminal-prompt">{prompt} </span>}
                  {line.text}
                </div>
              ),
            )}
            <form className="terminal-input" onSubmit={submit}>
              <label className="terminal-input__label" htmlFor={`terminal-input-${windowId}`}>
                <span className="terminal-prompt">{prompt} </span>
                <span
                  className="terminal-input__command"
                  data-cursor-position={cursorPosition}
                  aria-hidden="true"
                >
                  {command}
                  <span
                    className="terminal-input__cursor"
                    style={{ left: `${cursorOffset}px` }}
                  />
                  <span ref={cursorMeasureRef} className="terminal-input__cursor-measure">
                    {command.slice(0, cursorPosition)}
                  </span>
                </span>
                <input
                  ref={inputRef}
                  id={`terminal-input-${windowId}`}
                  value={command}
                  onChange={(event) => {
                    setCommand(event.target.value)
                    setCursorPosition(event.target.selectionStart ?? event.target.value.length)
                  }}
                  onSelect={(event) =>
                    setCursorPosition(event.currentTarget.selectionStart ?? command.length)
                  }
                  onKeyDown={handleCommandKeyDown}
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

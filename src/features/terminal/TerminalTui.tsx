import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { TerminalScreen } from './terminalEngine'

interface TerminalTuiProps {
  screen: TerminalScreen
  onExit: () => void
  onSave: (path: string, content: string) => void
}

interface ProcessRow {
  pid: number
  user: string
  cpu: number
  memory: number
  state: string
  command: string
}

const baseProcesses: ProcessRow[] = [
  { pid: 1, user: 'root', cpu: 0.2, memory: 0.8, state: 'S', command: 'runit' },
  { pid: 418, user: 'neko', cpu: 0.7, memory: 2.3, state: 'S', command: 'niri --session' },
  { pid: 762, user: 'neko', cpu: 1.4, memory: 4.8, state: 'R', command: 'nekovoid --desktop' },
  { pid: 804, user: 'neko', cpu: 0.3, memory: 1.1, state: 'S', command: 'neko-shell' },
  { pid: 921, user: 'neko', cpu: 0.0, memory: 0.6, state: 'S', command: 'mikufetch' },
  { pid: 947, user: 'neko', cpu: 0.1, memory: 1.7, state: 'S', command: 'noctalia-shell' },
  { pid: 1033, user: 'neko', cpu: 0.0, memory: 0.4, state: 'S', command: 'xdg-desktop-portal' },
]

const Meter = ({ label, value, detail }: { label: string; value: number; detail: string }) => (
  <div className="tui-meter">
    <span className="tui-meter__label">{label}</span>
    <span className="tui-meter__track">
      <i style={{ width: `${Math.min(value, 100)}%` }} />
    </span>
    <span className="tui-meter__detail">{detail}</span>
  </div>
)

const ProcessMonitor = ({ kind, onExit }: { kind: 'top' | 'htop'; onExit: () => void }) => {
  const [tick, setTick] = useState(0)
  const [selected, setSelected] = useState(0)
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'pid'>('cpu')
  const [filter, setFilter] = useState('')
  const [dialog, setDialog] = useState<'help' | 'search' | 'filter' | 'setup' | 'signal' | null>(
    null,
  )
  const [query, setQuery] = useState('')
  const [tree, setTree] = useState(false)
  const screenRef = useRef<HTMLDivElement>(null)
  const queryRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    screenRef.current?.focus()
    const timer = window.setInterval(() => setTick((value) => value + 1), 1600)
    return () => window.clearInterval(timer)
  }, [])

  const rows = useMemo(() => {
    const updated = baseProcesses.map((process, index) => ({
      ...process,
      cpu: Math.max(0, process.cpu + (((tick + index * 7) % 5) - 2) * 0.2),
      memory: process.memory + ((tick + index) % 3) * 0.1,
    }))
    const filtered = updated.filter((process) => process.command.includes(filter))
    if (tree) {
      const parent = filtered.find((process) => process.pid === 418)
      if (parent) return [parent, ...filtered.filter((process) => process.pid !== 418)]
    }
    return filtered.sort((a, b) => (sortBy === 'pid' ? a.pid - b.pid : b[sortBy] - a[sortBy]))
  }, [filter, sortBy, tick, tree])

  const openInput = (mode: 'search' | 'filter') => {
    setQuery(mode === 'filter' ? filter : '')
    setDialog(mode)
    window.setTimeout(() => queryRef.current?.focus(), 0)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && dialog && dialog !== 'search' && dialog !== 'filter') {
      event.preventDefault()
      setDialog(null)
      return
    }
    if (dialog === 'search' || dialog === 'filter') {
      if (event.key === 'Escape') {
        event.preventDefault()
        setDialog(null)
        screenRef.current?.focus()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        if (dialog === 'filter') setFilter(query)
        else if (query)
          setSelected(
            Math.max(
              0,
              rows.findIndex((row) => row.command.includes(query)),
            ),
          )
        setDialog(null)
        screenRef.current?.focus()
      }
      return
    }
    if (
      event.key === 'q' ||
      event.key === 'Q' ||
      event.key === 'Escape' ||
      (kind === 'htop' && event.key === 'F10')
    ) {
      event.preventDefault()
      onExit()
    } else if (event.key === 'ArrowDown' || (kind === 'top' && event.key === 'j')) {
      event.preventDefault()
      setSelected((value) => Math.min(value + 1, rows.length - 1))
    } else if (event.key === 'ArrowUp' || (kind === 'top' && event.key === 'k')) {
      event.preventDefault()
      setSelected((value) => Math.max(0, value - 1))
    } else if (kind === 'htop' && (event.key === 'F1' || event.key === '?')) {
      event.preventDefault()
      setDialog('help')
    } else if (kind === 'htop' && event.key === 'F2') {
      event.preventDefault()
      setDialog('setup')
    } else if (kind === 'htop' && (event.key === 'F3' || event.key === '/')) {
      event.preventDefault()
      openInput('search')
    } else if (kind === 'htop' && (event.key === 'F4' || event.key === '\\')) {
      event.preventDefault()
      openInput('filter')
    } else if (kind === 'htop' && (event.key === 'F5' || event.key.toLowerCase() === 't')) {
      event.preventDefault()
      setTree((value) => !value)
    } else if (kind === 'htop' && event.key === 'F6') {
      event.preventDefault()
      setSortBy((value) => (value === 'cpu' ? 'memory' : value === 'memory' ? 'pid' : 'cpu'))
    } else if (kind === 'htop' && event.key === 'F9') {
      event.preventDefault()
      setDialog('signal')
    } else if (kind === 'top' && event.key.toLowerCase() === 'h') {
      event.preventDefault()
      setDialog('help')
    } else if (event.key.toLowerCase() === 'p') {
      event.preventDefault()
      setSortBy('cpu')
    } else if (event.key.toLowerCase() === 'm') {
      event.preventDefault()
      setSortBy('memory')
    } else if (event.key.toLowerCase() === 't') {
      event.preventDefault()
      setSortBy('pid')
    } else if (kind === 'top' && event.key === '/') {
      event.preventDefault()
      openInput('filter')
    }
  }

  const cpu = 8 + ((tick * 7) % 17)
  const memory = 34 + ((tick * 3) % 9)
  return (
    <section
      className={`terminal-tui terminal-tui--${kind}`}
      aria-label={`${kind} monitor de procesos simulado`}
      onKeyDown={handleKeyDown}
      ref={screenRef}
      tabIndex={0}
    >
      {kind === 'htop' ? (
        <>
          <header className="htop-header">
            <div className="htop-meters">
              <div className="htop-meter-column">
                <Meter label="0" value={cpu} detail={`${cpu}.0%`} />
                <Meter
                  label="1"
                  value={Math.max(3, cpu - 3)}
                  detail={`${Math.max(3, cpu - 3)}.0%`}
                />
              </div>
              <div className="htop-meter-column">
                <Meter label="Mem" value={memory} detail={`${(memory * 40).toFixed(0)}M/4.0G`} />
                <Meter label="Swp" value={5} detail="64M/2.0G" />
              </div>
            </div>
            <div className="htop-stats">
              Tasks: 7, 1 running · Load average: 0.18 0.22 0.19 · Uptime: 02:14:08
            </div>
          </header>
          <ProcessTable
            rows={rows}
            selected={selected}
            kind="htop"
            tree={tree}
            onSelect={setSelected}
            onSort={setSortBy}
            sortBy={sortBy}
          />
          <footer className="htop-footer">
            <button onClick={() => setDialog('help')}>
              <b>F1</b> Help
            </button>
            <button onClick={() => setDialog('setup')}>
              <b>F2</b> Setup
            </button>
            <button onClick={() => openInput('search')}>
              <b>F3</b> Search
            </button>
            <button onClick={() => openInput('filter')}>
              <b>F4</b> Filter
            </button>
            <button onClick={() => setTree((value) => !value)}>
              <b>F5</b> Tree
            </button>
            <button
              onClick={() =>
                setSortBy((value) =>
                  value === 'cpu' ? 'memory' : value === 'memory' ? 'pid' : 'cpu',
                )
              }
            >
              <b>F6</b> Sort: {sortBy}
            </button>
            <button onClick={() => setDialog('signal')}>
              <b>F7</b> Nice −
            </button>
            <button onClick={() => setDialog('signal')}>
              <b>F8</b> Nice +
            </button>
            <button onClick={() => setDialog('signal')}>
              <b>F9</b> Kill
            </button>
            <button onClick={onExit}>
              <b>F10</b> Quit
            </button>
          </footer>
          <small className="monitor-note">
            Vista de demostración · no controla procesos del dispositivo
          </small>
        </>
      ) : (
        <>
          <div className="top-banner">
            top - {new Date().toLocaleTimeString('en-GB')} up 2:14, 1 user, load average: 0.18,
            0.22, 0.19
          </div>
          <div>
            Tasks: <b>7</b> total, <b>1</b> running, <b>6</b> sleeping
          </div>
          <div>
            %Cpu(s): <b>{cpu}.0</b> us, 1.2 sy, 0.0 ni, {100 - cpu}.8 id
          </div>
          <div>
            MiB Mem : <b>4096.0</b> total, 2712.0 free, 1024.0 used, 360.0 buff/cache
          </div>
          <div>MiB Swap: 2048.0 total, 1984.0 free, 64.0 used. 2800.0 avail Mem</div>
          <ProcessTable
            rows={rows}
            selected={selected}
            kind="top"
            tree={false}
            onSelect={setSelected}
            onSort={setSortBy}
            sortBy={sortBy}
          />
          {dialog === 'help' && (
            <div className="tui-help">
              q quit · ↑/↓ select · P sort CPU · M sort memory · T sort PID · / filter · h close
              help
            </div>
          )}
          <footer className="top-footer">Processes shown are synthetic · q quit · h help</footer>
        </>
      )}
      {(dialog === 'search' || dialog === 'filter') && (
        <div
          className="monitor-dialog"
          role="dialog"
          aria-label={dialog === 'search' ? 'Buscar proceso' : 'Filtrar procesos'}
        >
          <label>
            {dialog === 'search' ? 'Search:' : 'Filter:'}
            <input
              aria-label={dialog === 'search' ? 'Buscar proceso' : 'Filtrar procesos'}
              ref={queryRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="nombre de proceso"
            />
          </label>
          <span>Enter aplicar · Esc cancelar</span>
        </div>
      )}
      {(dialog === 'setup' || dialog === 'signal') && (
        <div
          className="monitor-dialog"
          role="dialog"
          aria-label={dialog === 'setup' ? 'Configuración de htop' : 'Señal de proceso'}
        >
          <strong>{dialog === 'setup' ? 'htop setup' : 'Signal / nice'}</strong>
          <p>
            {dialog === 'setup'
              ? 'Columnas: PID · USER · CPU% · MEM% · Command. F6 cambia el orden.'
              : 'No se pueden enviar señales ni cambiar prioridad desde esta terminal web.'}
          </p>
          <button onClick={() => setDialog(null)}>Cerrar · Esc</button>
        </div>
      )}
      {dialog === 'help' && kind === 'htop' && (
        <div
          className="monitor-dialog monitor-dialog--help"
          role="dialog"
          aria-label="Ayuda de htop"
        >
          <strong>htop · teclas</strong>
          <span>↑/↓ seleccionar · F1 ayuda · F2 configuración · F3 buscar · F4 filtrar</span>
          <span>F5 árbol · F6 ordenar · F9 señal no disponible · F10/q salir</span>
          <button onClick={() => setDialog(null)}>Cerrar · Esc</button>
        </div>
      )}
      <span className="tui-sr-only" aria-live="polite">
        Datos de demostración; no se consultan procesos del dispositivo.
      </span>
    </section>
  )
}

const ProcessTable = ({
  rows,
  selected,
  kind,
  tree,
  onSelect,
  onSort,
  sortBy,
}: {
  rows: ProcessRow[]
  selected: number
  kind: 'top' | 'htop'
  tree: boolean
  onSelect: (index: number) => void
  onSort: (key: 'cpu' | 'memory' | 'pid') => void
  sortBy: 'cpu' | 'memory' | 'pid'
}) => (
  <div className={`process-table process-table--${kind}`}>
    <div className="process-table__head">
      <button onClick={() => onSort('pid')}>PID{sortBy === 'pid' ? ' ▼' : ''}</button>
      <span>USER</span>
      <span>PRI</span>
      <span>NI</span>
      <span>VIRT</span>
      <span>RES</span>
      <span>S</span>
      <button onClick={() => onSort('cpu')}>CPU%{sortBy === 'cpu' ? ' ▼' : ''}</button>
      <button onClick={() => onSort('memory')}>MEM%{sortBy === 'memory' ? ' ▼' : ''}</button>
      <span>TIME+</span>
      <span>Command</span>
    </div>
    {rows.map((process, index) => (
      <div
        className={`process-table__row${index === selected ? ' is-selected' : ''}`}
        key={process.pid}
        onClick={() => onSelect(index)}
      >
        <span>{process.pid}</span>
        <span>{process.user}</span>
        <span>20</span>
        <span>0</span>
        <span>{Math.round(process.memory * 18)}M</span>
        <span>{Math.round(process.memory * 8)}M</span>
        <span>{process.state}</span>
        <span>{process.cpu.toFixed(1)}</span>
        <span>{process.memory.toFixed(1)}</span>
        <span>0:0{index}.04</span>
        <span>
          {tree && process.pid !== 418 ? ' ├─ ' : ''}
          {process.command}
        </span>
      </div>
    ))}
  </div>
)

const BtopMonitor = ({ onExit }: { onExit: () => void }) => {
  const [tick, setTick] = useState(0)
  const [selected, setSelected] = useState(0)
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu')
  const [overlay, setOverlay] = useState<'help' | 'menu' | null>(null)
  const screenRef = useRef<HTMLElement>(null)
  useEffect(() => {
    screenRef.current?.focus()
    const timer = window.setInterval(() => setTick((value) => value + 1), 1400)
    return () => window.clearInterval(timer)
  }, [])

  const cpu = 14 + ((tick * 7) % 28)
  const memory = 42 + ((tick * 3) % 12)
  const net = 26 + ((tick * 11) % 52)
  const processes = useMemo(
    () =>
      baseProcesses
        .map((process, index) => ({
          ...process,
          cpu: Math.max(0, process.cpu + (((tick + index * 3) % 7) - 3) * 0.35),
          memory: process.memory + ((tick + index) % 4) * 0.15,
        }))
        .sort((a, b) => b[sortBy] - a[sortBy]),
    [sortBy, tick],
  )

  return (
    <section
      className="terminal-tui terminal-tui--btop"
      aria-label="btop monitor de sistema simulado"
      ref={screenRef}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'q' || event.key === 'Q' || event.key === 'Escape') {
          if (overlay) setOverlay(null)
          else onExit()
        } else if (event.key === 'F1' || event.key === '?')
          setOverlay((value) => (value === 'help' ? null : 'help'))
        else if (event.key.toLowerCase() === 'm')
          setOverlay((value) => (value === 'menu' ? null : 'menu'))
        else if (event.key === '1') setSortBy((value) => (value === 'cpu' ? 'memory' : 'cpu'))
        else if (event.key === 'ArrowDown')
          setSelected((value) => Math.min(value + 1, processes.length - 1))
        else if (event.key === 'ArrowUp') setSelected((value) => Math.max(value - 1, 0))
      }}
    >
      <header className="btop-title">
        <strong>btop++</strong>
        <span>nekovoid · {new Date().toLocaleTimeString('en-GB')}</span>
        <span>q quit · ? help</span>
      </header>
      <div className="btop-panels">
        <section className="btop-panel btop-panel--cpu">
          <header>
            CPU <span>AMD Ryzen · 8 cores</span>
          </header>
          <Meter label="CPU" value={cpu} detail={`${cpu.toFixed(1)}%`} />
          <div className="btop-graph" aria-label="Historial CPU">
            {Array.from({ length: 32 }, (_, index) => (
              <i key={index} style={{ height: `${14 + ((tick * 13 + index * 17) % 82)}%` }} />
            ))}
          </div>
          <div className="btop-cores">
            {Array.from({ length: 8 }, (_, index) => (
              <Meter
                key={index}
                label={`C${index}`}
                value={(cpu + index * 9 + tick * 2) % 100}
                detail={`${((cpu + index * 9 + tick * 2) % 100).toFixed(0)}%`}
              />
            ))}
          </div>
        </section>
        <section className="btop-panel btop-panel--memory">
          <header>
            MEMORY <span>4.00 GiB</span>
          </header>
          <Meter label="Used" value={memory} detail={`${(memory * 0.04).toFixed(2)} GiB`} />
          <div className="btop-graph btop-graph--memory" aria-label="Historial de memoria">
            {Array.from({ length: 24 }, (_, index) => (
              <i key={index} style={{ height: `${20 + ((tick * 5 + index * 13) % 68)}%` }} />
            ))}
          </div>
          <p>
            Free {(4 - memory * 0.04).toFixed(2)} GiB <span>Cache 0.62 GiB</span>
          </p>
          <Meter label="Swap" value={3 + (tick % 5)} detail="0.06 / 2.00 GiB" />
        </section>
        <section className="btop-panel btop-panel--network">
          <header>
            NETWORK <span>enp5s0</span>
          </header>
          <div className="btop-network-values">
            <strong>↓ {(net * 12).toFixed(1)} KiB/s</strong>
            <strong>↑ {(net * 4.2).toFixed(1)} KiB/s</strong>
          </div>
          <div className="btop-graph" aria-label="Historial de red">
            {Array.from({ length: 24 }, (_, index) => (
              <i key={index} style={{ height: `${10 + ((tick * 7 + index * 19) % 80)}%` }} />
            ))}
          </div>
          <p>
            Total ↓ 128.4 MiB <span>↑ 24.8 MiB</span>
          </p>
        </section>
        <section className="btop-panel btop-panel--disk">
          <header>
            DISKS <span>/ · 80 GiB</span>
          </header>
          <Meter label="/" value={38 + (tick % 4)} detail="30.4 / 80.0 GiB" />
          <div className="btop-disk-stats">
            Read 0 B/s <span>Write 12.0 KiB/s</span>
          </div>
        </section>
      </div>
      <section className="btop-processes">
        <header>
          Processes{' '}
          <span>
            {processes.length} · sort: {sortBy.toUpperCase()}
          </span>
          <button onClick={() => setSortBy((value) => (value === 'cpu' ? 'memory' : 'cpu'))}>
            sort (1)
          </button>
        </header>
        <div className="btop-process-head">
          <span>PID</span>
          <span>USER</span>
          <span>CPU%</span>
          <span>MEM</span>
          <span>Command</span>
        </div>
        {processes.map((process, index) => (
          <div
            className={`btop-process-row${index === selected ? ' is-selected' : ''}`}
            key={process.pid}
            onClick={() => setSelected(index)}
          >
            <span>{process.pid}</span>
            <span>{process.user}</span>
            <span>{process.cpu.toFixed(1)}</span>
            <span>{process.memory.toFixed(1)}%</span>
            <span>{process.command}</span>
          </div>
        ))}
      </section>
      <footer className="btop-footer">
        <span>Esc/q quit</span>
        <span>↑/↓ select process</span>
        <span>1 sort CPU/memory</span>
        <span>m menu</span>
        <span>? help</span>
        <small>Valores ficticios · sin acceso al sistema anfitrión</small>
      </footer>
      {overlay && (
        <div
          className="btop-overlay"
          role="dialog"
          aria-label={overlay === 'help' ? 'Ayuda de btop' : 'Menú de btop'}
        >
          <strong>{overlay === 'help' ? 'btop++ · Keybindings' : 'btop++ · Main menu'}</strong>
          {overlay === 'help' ? (
            <>
              <span>↑/↓ seleccionar proceso</span>
              <span>1 alterna orden CPU/memoria</span>
              <span>m menú · Esc/q salir</span>
            </>
          ) : (
            <>
              <button onClick={() => setSortBy((value) => (value === 'cpu' ? 'memory' : 'cpu'))}>
                Cambiar orden: {sortBy.toUpperCase()}
              </button>
              <button onClick={() => setOverlay('help')}>Ayuda</button>
              <button onClick={onExit}>Salir</button>
            </>
          )}
          <button onClick={() => setOverlay(null)}>Cerrar · Esc</button>
        </div>
      )}
    </section>
  )
}

const BatPager = ({
  path,
  content,
  onExit,
}: {
  path: string
  content: string
  onExit: () => void
}) => {
  const pagerRef = useRef<HTMLDivElement>(null)
  useEffect(() => pagerRef.current?.focus(), [])
  const lines = content.split('\n')
  return (
    <section
      className="terminal-tui bat-pager"
      aria-label={`bat pager: ${path}`}
      onKeyDown={(event) => {
        if (event.key === 'q' || event.key === 'Escape') onExit()
        if (event.key === 'j' || event.key === 'ArrowDown') pagerRef.current?.scrollBy({ top: 28 })
        if (event.key === 'k' || event.key === 'ArrowUp') pagerRef.current?.scrollBy({ top: -28 })
      }}
      ref={pagerRef}
      tabIndex={0}
    >
      <header className="bat-header">
        <span>────</span>
        <strong>{path}</strong>
        <span>────</span>
      </header>
      <div className="bat-lines">
        {lines.map((line, index) => {
          const envMatch = /^([A-Z_]+)(=)(.*)$/.exec(line)
          const markdownHeading = /^#{1,6}\s/.test(line)
          return (
            <div className="bat-line" key={`${index}-${line}`}>
              <span className="bat-line__number">{String(index + 1).padStart(3)}</span>
              <span className="bat-line__content">
                {envMatch ? (
                  <>
                    <span className="bat-token--key">{envMatch[1]}</span>
                    <span className="bat-token--operator">{envMatch[2]}</span>
                    <span className="bat-token--string">{envMatch[3]}</span>
                  </>
                ) : markdownHeading ? (
                  <span className="bat-token--heading">{line}</span>
                ) : (
                  highlightBatLine(line)
                )}
              </span>
            </div>
          )
        })}
      </div>
      <footer className="bat-footer">
        <span>bat · theme: Neko Void</span>
        <span>{lines.length} lines · q quit · ↑/↓ scroll</span>
      </footer>
    </section>
  )
}

const highlightBatLine = (line: string) => {
  const parts = line.split(/("[^"\n]*"|\b(?:true|false|null|Linux|Neko Void)\b|\b\d+\b)/g)
  return parts.map((part, index) => {
    const type = /^"/.test(part)
      ? 'string'
      : /^(true|false|null|Linux|Neko Void)$/.test(part)
        ? 'keyword'
        : /^\d+$/.test(part)
          ? 'number'
          : ''
    return type ? (
      <span className={`bat-token--${type}`} key={index}>
        {part}
      </span>
    ) : (
      part
    )
  })
}

const NanoEditor = ({
  path,
  initialContent,
  onSave,
  onExit,
}: {
  path: string
  initialContent: string
  onSave: (path: string, content: string) => void
  onExit: () => void
}) => {
  const [content, setContent] = useState(initialContent)
  const [savedContent, setSavedContent] = useState(initialContent)
  const [status, setStatus] = useState('')
  const [confirmExit, setConfirmExit] = useState(false)
  const dirty = content !== savedContent

  const save = () => {
    onSave(path, content)
    setSavedContent(content)
    setStatus(
      `Wrote ${content.split('\n').length} line${content.split('\n').length === 1 ? '' : 's'}`,
    )
  }
  const exit = () => {
    if (dirty) setConfirmExit(true)
    else onExit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'o') {
      event.preventDefault()
      save()
    } else if (event.ctrlKey && event.key.toLowerCase() === 'x') {
      event.preventDefault()
      exit()
    } else if (event.ctrlKey && event.key.toLowerCase() === 'g') {
      event.preventDefault()
      setStatus('^O Write Out  ^W Where Is  ^K Cut  ^U Paste  ^X Exit')
    } else if (
      confirmExit &&
      (event.key.toLowerCase() === 'y' ||
        event.key.toLowerCase() === 'n' ||
        event.key.toLowerCase() === 'c')
    ) {
      event.preventDefault()
      if (event.key.toLowerCase() === 'y') save()
      if (event.key.toLowerCase() !== 'c') onExit()
      setConfirmExit(false)
    } else if (event.key === 'Escape' && confirmExit) {
      setConfirmExit(false)
    }
  }

  return (
    <section className="terminal-tui nano-screen" aria-label="GNU nano editor">
      <header className="nano-title">
        GNU nano 8.4{' '}
        <span>
          {path}
          {dirty ? ' *' : ''}
        </span>
      </header>
      <textarea
        className="nano-buffer"
        aria-label={`Contenido de ${path}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoFocus
      />
      <div className="nano-status" role="status">
        {confirmExit ? 'Save modified buffer?  Y Yes  N No  ^C Cancel' : status}
      </div>
      <footer className="nano-shortcuts">
        <button onClick={() => setStatus('Help: editor simulado de Neko Void')}>^G Help</button>
        <button onClick={save}>^O Write Out</button>
        <button onClick={() => setStatus('Where Is: usa Ctrl+W en nano nativo')}>
          ^W Where Is
        </button>
        <button onClick={() => setStatus('Cortar: selecciona texto y usa Ctrl+X del navegador')}>
          ^K Cut
        </button>
        <button onClick={() => setStatus('Pegar: usa Ctrl+V')}>^U Paste</button>
        <button onClick={exit}>^X Exit</button>
      </footer>
    </section>
  )
}

export const TerminalTui = ({ screen, onExit, onSave }: TerminalTuiProps) =>
  screen.kind === 'nano' ? (
    <NanoEditor
      path={screen.path}
      initialContent={screen.content}
      onSave={onSave}
      onExit={onExit}
    />
  ) : screen.kind === 'bat' ? (
    <BatPager path={screen.path} content={screen.content} onExit={onExit} />
  ) : screen.kind === 'btop' ? (
    <BtopMonitor onExit={onExit} />
  ) : (
    <ProcessMonitor kind={screen.kind} onExit={onExit} />
  )

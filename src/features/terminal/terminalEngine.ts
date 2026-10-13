import type { TerminalLine } from '../../core/model/types'

export interface TerminalContext {
  workspaceNumber: number
  workspaceName: string
  virtualFiles?: Record<string, string>
}

export type TerminalScreen =
  | { kind: 'nano'; path: string; content: string }
  | { kind: 'bat'; path: string; content: string }
  | { kind: 'top' | 'htop' | 'btop' }

export interface TerminalResult {
  clear: boolean
  close: boolean
  lines: Array<Pick<TerminalLine, 'kind' | 'text'>>
  screen?: TerminalScreen
}

const output = (text: string): TerminalResult => ({
  clear: false,
  close: false,
  lines: [{ kind: 'output', text }],
})

const error = (text: string): TerminalResult => ({
  clear: false,
  close: false,
  lines: [{ kind: 'error', text }],
})

const files: Record<string, string> = {
  '/etc/os-release': [
    'NAME="Neko Void Linux"',
    'PRETTY_NAME="Neko Void Linux — Niri-inspired web desktop"',
    'ID=nekovoid',
    'HOME_URL="https://nekovoid.org"',
    'SHELL="neko-shell"',
  ].join('\n'),
  '/etc/hostname': 'nekovoid',
  '/etc/issue': 'Neko Void Linux\\n \\l',
  '/home/nekovoid/README.md':
    'Bienvenido a Neko Void.\nEste es un escritorio web inspirado en Niri.',
  '/home/nekovoid/Projects/README.md': 'Tus proyectos aparecerían aquí.',
}

const normalizeVirtualPath = (path: string): string => {
  if (path.startsWith('/')) return path.replace(/\/+$/, '') || '/'
  if (path === 'README.md') return '/home/nekovoid/README.md'
  return `/home/nekovoid/${path.replace(/^\.\//, '').replace(/\/+$/, '')}`
}

const readVirtualFile = (
  path: string,
  virtualFiles: Record<string, string> = {},
): string | undefined =>
  virtualFiles[normalizeVirtualPath(path)] ?? files[normalizeVirtualPath(path)]

const splitArgs = (input: string): string[] => {
  const args: string[] = []
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g
  for (const match of input.matchAll(pattern)) args.push(match[1] ?? match[2] ?? match[3])
  return args
}

const readFiles = (
  args: string[],
  pretty = false,
  virtualFiles: Record<string, string> = {},
): TerminalResult => {
  if (args.length === 0) return error(`${pretty ? 'bat' : 'cat'}: falta indicar un archivo`)

  const content = args.map((path) => readVirtualFile(path, virtualFiles))
  const missing = args.filter((_, index) => content[index] === undefined)
  if (missing.length)
    return error(`${pretty ? 'bat' : 'cat'}: archivo no encontrado: ${missing.join(', ')}`)

  const text = content.map((value, index) => {
    if (!pretty) return value!
    const numbered = value!
      .split('\n')
      .map((line, lineIndex) => `${String(lineIndex + 1).padStart(2)} │ ${line}`)
    return `──── ${args[index]} ────\n${numbered.join('\n')}`
  })
  return output(text.join('\n'))
}

const runAwk = (args: string[], virtualFiles: Record<string, string> = {}): TerminalResult => {
  if (args.length === 0) return output("Uso: awk '{print $1}' /etc/os-release")
  const expression = args[0]
  const fieldMatch = /^\{print\s+\$(\d+)\}$/.exec(expression)
  if (!fieldMatch || !args[1] || args.length > 2) {
    return error("awk: formato simulado disponible: awk '{print $1}' ARCHIVO")
  }

  const file = readVirtualFile(args[1], virtualFiles)
  if (file === undefined) return error(`awk: archivo virtual no encontrado: ${args[1]}`)
  const fieldIndex = Number(fieldMatch[1]) - 1
  return output(
    file
      .split('\n')
      .map((line) => line.trim().split(/\s+/)[fieldIndex] ?? '')
      .join('\n'),
  )
}

export const executeTerminalCommand = (
  rawCommand: string,
  context: TerminalContext,
): TerminalResult => {
  const command = rawCommand.trim()
  if (!command) return { clear: false, close: false, lines: [] }
  const [name] = command.split(/\s+/)
  const argumentText = command.slice(name.length).trim()
  const args = splitArgs(argumentText)

  if (name === 'clear' || name === 'cls') {
    return { clear: true, close: false, lines: [] }
  }
  if (name === 'exit') {
    return { clear: false, close: true, lines: [] }
  }
  if (name === 'help') {
    return output(
      'help  clear/cls  mikufetch  pwd  ls/dir  whoami  date  workspace  echo  uname  cat  bat  nano  top  htop  btop  awk  exec  exit',
    )
  }
  if (name === 'mikufetch' || name === 'neofetch') {
    return {
      clear: false,
      close: false,
      lines: [{ kind: 'fetch', text: '' }],
    }
  }
  if (name === 'pwd') return output('/home/nekovoid')
  if (name === 'ls' || name === 'dir') {
    const names = ['Desktop', 'Documents', 'Projects', 'README.md']
    const showAll = args.some((arg) => arg === '-a' || arg === '-la' || arg === '-al')
    const long = args.some((arg) => arg === '-l' || arg === '-la' || arg === '-al')
    const visible = showAll ? ['.', '..', ...names] : names
    return output(
      long
        ? visible
            .map(
              (file) => `-rw-r--r--  1 neko neko  ${file === 'README.md' ? '68' : '4096'}  ${file}`,
            )
            .join('\n')
        : visible.join('  '),
    )
  }
  if (name === 'whoami') return output('visitor')
  if (name === 'date') return output(new Date().toLocaleString('es-ES'))
  if (name === 'workspace') return output(`${context.workspaceNumber}: ${context.workspaceName}`)
  if (name === 'echo') {
    const noNewline = args[0] === '-n'
    const escapeSequences = args[0] === '-e'
    const values = noNewline || escapeSequences || args[0] === '-E' ? args.slice(1) : args
    const text = values.join(' ')
    const escaped = escapeSequences
      ? text.replace(
          /\\(n|t|\\)/g,
          (_, char: string) => ({ n: '\n', t: '\t', '\\': '\\' })[char] ?? char,
        )
      : text
    // Output blocks already end on a new terminal row; avoid a visible extra blank row.
    return output(escaped)
  }
  if (name === 'uname') {
    const options = args.join('')
    const fields: Record<string, string> = {
      s: 'Linux',
      n: 'nekovoid',
      r: '6.12.0-nekovoid',
      v: '#1 SMP PREEMPT_DYNAMIC',
      m: 'x86_64',
      o: 'GNU/NekoVoid',
      p: 'unknown',
      i: 'unknown',
    }
    if (options.includes('a'))
      return output('Linux nekovoid 6.12.0-nekovoid #1 SMP PREEMPT_DYNAMIC x86_64 GNU/NekoVoid')
    const selected = [...new Set(options.replaceAll('-', '').split(''))]
      .filter((flag) => fields[flag])
      .map((flag) => fields[flag])
    return output(selected.length ? selected.join(' ') : fields.s)
  }
  if (name === 'cat')
    return readFiles(
      args.filter((arg) => !arg.startsWith('-')),
      false,
      context.virtualFiles,
    )
  if (name === 'bat') {
    const paths = args.filter((arg) => !arg.startsWith('-'))
    if (args.includes('--plain') || args.includes('-p')) {
      return readFiles(paths, false, context.virtualFiles)
    }
    if (paths.length !== 1)
      return error('bat: indica un archivo (usa bat --plain para salida simple)')
    const content = readVirtualFile(paths[0], context.virtualFiles)
    if (content === undefined) return error(`bat: archivo no encontrado: ${paths[0]}`)
    return {
      clear: false,
      close: false,
      lines: [],
      screen: { kind: 'bat', path: paths[0], content },
    }
  }
  if (name === 'nano') {
    const path = args.find((arg) => !arg.startsWith('-')) ?? 'New Buffer'
    return {
      clear: false,
      close: false,
      lines: [],
      screen: {
        kind: 'nano',
        path,
        content: path === 'New Buffer' ? '' : (readVirtualFile(path, context.virtualFiles) ?? ''),
      },
    }
  }
  if (name === 'top' || name === 'htop' || name === 'btop') {
    return { clear: false, close: false, lines: [], screen: { kind: name } }
  }
  if (name === 'awk') return runAwk(args, context.virtualFiles)
  if (name === 'exec') {
    if (!argumentText) return error('exec: falta un comando')
    if (argumentText.trimStart().startsWith('exec ')) return error('exec: no se permite recursión')
    const nested = executeTerminalCommand(argumentText, context)
    return nested.lines.length || nested.screen || nested.clear || nested.close
      ? nested
      : error('exec: comando no disponible en el entorno virtual')
  }

  return error(`${name}: comando no encontrado`)
}

import type { TerminalLine } from '../../core/model/types'

export interface TerminalContext {
  workspaceNumber: number
  workspaceName: string
  virtualFiles?: Record<string, string>
}

export const terminalCommandNames = [
  'help',
  'clear',
  'cls',
  'mikufetch',
  'pwd',
  'ls',
  'dir',
  'whoami',
  'date',
  'workspace',
  'echo',
  'uname',
  'cat',
  'bat',
  'rm',
  'nano',
  'top',
  'htop',
  'btop',
  'awk',
  'exec',
  'exit',
] as const

export type TerminalScreen =
  | { kind: 'nano'; path: string; content: string }
  | { kind: 'bat'; path: string; content: string }
  | { kind: 'top' | 'htop' | 'btop' }

export interface TerminalResult {
  clear: boolean
  close: boolean
  lines: Array<Omit<TerminalLine, 'id'>>
  screen?: TerminalScreen
  writes?: Array<{ path: string; content: string }>
  deletes?: string[]
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

const homePath = '/home/nekovoid'
const defaultHomeEntries = ['Desktop', 'Documents', 'Projects', 'README.md']
const defaultHomeDirectories = new Set(['Desktop', 'Documents', 'Projects'])

const rmHelp = `Usage: rm [OPTION]... [FILE]...
Remove (unlink) the FILE(s).

  -f, --force           ignore nonexistent files and arguments, never prompt
  -i                    prompt before every removal
  -I                    prompt once before removing more than three files, or
                          when removing recursively; less intrusive than -i,
                          while still giving protection against most mistakes
      --interactive[=WHEN]  prompt according to WHEN: never, once (-I), or
                          always (-i); without WHEN, prompt always
      --one-file-system  when removing a hierarchy recursively, skip any
                          directory that is on a file system different from
                          that of the corresponding command line argument
      --no-preserve-root  do not treat '/' specially
      --preserve-root[=all]  do not remove '/' (default);
                              with 'all', reject any command line argument
                              on a separate device from its parent
  -r, -R, --recursive   remove directories and their contents recursively
  -d, --dir             remove empty directories
  -v, --verbose         explain what is being done
      --help        display this help and exit
      --version     output version information and exit

By default, rm does not remove directories.  Use the --recursive (-r or -R)
option to remove each listed directory, too, along with all of its contents.

To remove a file whose name starts with a '-', for example '-foo',
use one of these commands:
  rm -- -foo

  rm ./-foo

Note that if you use rm to remove a file, it might be possible to recover
some of its contents, given sufficient expertise and/or time.  For greater
assurance that the contents are truly unrecoverable, consider using shred(1).

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Report any translation bugs to <https://translationproject.org/team/>
Full documentation <https://www.gnu.org/software/coreutils/rm>
or available locally via: info '(coreutils) rm invocation'`

export const getTerminalFileNames = (
  virtualFiles: Record<string, string> = {},
): string[] => {
  const absolutePaths = [...Object.keys(files), ...Object.keys(virtualFiles)]
  return [
    ...new Set(
      absolutePaths.flatMap((path) =>
        path.startsWith('/home/nekovoid/')
          ? [path, path.slice('/home/nekovoid/'.length)]
          : [path],
      ),
    ),
  ].sort()
}

const normalizeVirtualPath = (path: string): string => {
  const absolutePath = path.startsWith('/') ? path : `${homePath}/${path}`
  const parts: string[] = []
  for (const part of absolutePath.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return `/${parts.join('/')}`
}

const isWritablePath = (path: string): boolean => path.startsWith(`${homePath}/`)

const getHomeEntries = (virtualFiles: Record<string, string> = {}) => {
  const entries = new Set(defaultHomeEntries)
  const virtualDirectories = new Set<string>()

  for (const path of Object.keys(virtualFiles)) {
    if (!path.startsWith(`${homePath}/`)) continue
    const relativePath = path.slice(homePath.length + 1)
    const [entry, ...remaining] = relativePath.split('/')
    if (!entry) continue
    entries.add(entry)
    if (remaining.length) virtualDirectories.add(entry)
  }

  return { entries: [...entries], virtualDirectories }
}

const readVirtualFile = (
  path: string,
  virtualFiles: Record<string, string> = {},
): string | undefined => {
  const normalizedPath = normalizeVirtualPath(path)
  return virtualFiles[normalizedPath] ?? files[normalizedPath]
}

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

const renderBatOutput = (
  paths: string[],
  virtualFiles: Record<string, string> = {},
) => {
  const content = paths.map((path) => readVirtualFile(path, virtualFiles))
  const missing = paths.filter((_, index) => content[index] === undefined)
  if (missing.length) return error(`bat: archivo no encontrado: ${missing.join(', ')}`)

  return {
    clear: false,
    close: false,
    lines: content.map((value, index) => ({
      kind: 'bat',
      path: paths[index],
      text: value!,
    })),
  } satisfies TerminalResult
}

const runAwk = (
  args: string[],
  virtualFiles: Record<string, string> = {},
): TerminalResult => {
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
    return output(terminalCommandNames.join('  '))
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
    if (args.includes('--help') || args.includes('-?')) {
      return output(
        `Usage: ${name} [OPTION]... [FILE]...\nList information about the FILEs (the current directory by default).\n\n  -a, --all     do not ignore entries starting with .\n  -l            use a long listing format\n      --help    display this help and exit`,
      )
    }
    const { entries: names, virtualDirectories } = getHomeEntries(context.virtualFiles)
    const showAll = args.some((arg) => arg === '-a' || arg === '-la' || arg === '-al')
    const long = args.some((arg) => arg === '-l' || arg === '-la' || arg === '-al')
    const visible = showAll ? ['.', '..', ...names] : names
    return output(
      long
        ? visible.map((file) => {
            const isDirectory =
              file === '.' ||
              file === '..' ||
              defaultHomeDirectories.has(file) ||
              virtualDirectories.has(file)
            const content = context.virtualFiles?.[`${homePath}/${file}`] ?? files[`${homePath}/${file}`]
            const size = isDirectory ? 4096 : (content ?? '').length
            return `${isDirectory ? 'drwxr-xr-x' : '-rw-r--r--'}  1 neko neko  ${size}  ${file}`
          }).join('\n')
        : visible.join('  '),
    )
  }
  if (name === 'whoami') return output('visitor')
  if (name === 'date') return output(new Date().toLocaleString('es-ES'))
  if (name === 'workspace') return output(`${context.workspaceNumber}: ${context.workspaceName}`)
  if (name === 'echo') {
    const redirectIndex = args.findIndex((arg) => arg === '>' || arg === '>>')
    const echoArgs = redirectIndex === -1 ? args : args.slice(0, redirectIndex)
    const redirect = redirectIndex === -1 ? undefined : args[redirectIndex]
    const redirectPath = redirectIndex === -1 ? undefined : args[redirectIndex + 1]
    if (redirect && (!redirectPath || redirectIndex + 2 !== args.length)) {
      return error('echo: redirección inválida')
    }

    const noNewline = echoArgs[0] === '-n'
    const escapeSequences = echoArgs[0] === '-e'
    const values =
      noNewline || escapeSequences || echoArgs[0] === '-E' ? echoArgs.slice(1) : echoArgs
    const text = values.join(' ')
    const escaped = escapeSequences
      ? text.replace(
          /\\(n|t|\\)/g,
          (_, char: string) => ({ n: '\n', t: '\t', '\\': '\\' })[char] ?? char,
        )
      : text
    if (redirectPath) {
      const path = normalizeVirtualPath(redirectPath)
      if (!isWritablePath(path)) return error(`bash: ${redirectPath}: Permission denied`)
      const existing = readVirtualFile(redirectPath, context.virtualFiles) ?? ''
      const content =
        redirect === '>>' && existing
          ? `${existing}${noNewline ? '' : '\n'}${escaped}`
          : escaped
      return {
        clear: false,
        close: false,
        lines: [],
        writes: [{ path, content }],
      }
    }
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
    if (args.includes('--help') || args.includes('-h')) {
      return output(
        'A cat(1) clone with syntax highlighting and Git integration.\n\nUsage: bat [OPTIONS] [FILE]...\n\nArguments:\n  [FILE]...     File(s) to print / concatenate. Use - or no argument to read standard input.\n\nOptions:\n  -p, --plain   Only show plain style, no decorations.\n  -l, --language <language>  Set the syntax highlighting language.\n      --help    Print help information.',
      )
    }
    if (args.includes('--version') || args.includes('-V')) return output('bat 0.26.1')
    const paths = args.filter((arg) => !arg.startsWith('-'))
    if (args.some((arg) => arg === '--plain' || arg === '-p' || arg === '-pp')) {
      return readFiles(paths, false, context.virtualFiles)
    }
    if (paths.length === 0) return error('bat: entrada estándar no disponible en este terminal')
    const content =
      paths.length === 1
        ? readVirtualFile(paths[0], context.virtualFiles)
        : undefined
    if (content === undefined && paths.length === 1)
      return error(`bat: archivo no encontrado: ${paths[0]}`)
    if (
      paths.length === 1 &&
      content!.split('\n').length > 24 &&
      !args.includes('--paging=never')
    ) {
      return {
        clear: false,
        close: false,
        lines: [],
        screen: { kind: 'bat', path: paths[0], content: content! },
      }
    }
    return renderBatOutput(paths, context.virtualFiles)
  }
  if (name === 'rm') {
    if (args.includes('--help')) return output(rmHelp)
    if (args.includes('--version')) {
      return output(
        'rm (GNU coreutils) 9.8\nCopyright (C) 2025 Free Software Foundation, Inc.\nLicense GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.\nThis is free software: you are free to change and redistribute it.\nThere is NO WARRANTY, to the extent permitted by law.\n\nWritten by Paul Rubin, David MacKenzie, Richard M. Stallman, and Jim Meyering.',
      )
    }
    const force = args.some((arg) => arg.startsWith('-') && arg.includes('f'))
    const paths = args.filter((arg) => !arg.startsWith('-'))
    if (paths.length === 0) return error('rm: missing operand')

    const deletes: string[] = []
    const errors: Array<Omit<TerminalLine, 'id'>> = []
    for (const requestedPath of paths) {
      const path = normalizeVirtualPath(requestedPath)
      if (!isWritablePath(path)) {
        errors.push({
          kind: 'error',
          text: `rm: cannot remove '${requestedPath}': Permission denied`,
        })
        continue
      }

      const relativePath = path.slice(homePath.length + 1)
      const isDirectory =
        defaultHomeDirectories.has(relativePath) ||
        [...Object.keys(files), ...Object.keys(context.virtualFiles ?? {})].some((filePath) =>
          filePath.startsWith(`${path}/`),
        )
      if (isDirectory) {
        errors.push({ kind: 'error', text: `rm: cannot remove '${requestedPath}': Is a directory` })
        continue
      }

      if (files[path] !== undefined) {
        errors.push({
          kind: 'error',
          text: `rm: cannot remove '${requestedPath}': Permission denied`,
        })
        continue
      }

      if (context.virtualFiles?.[path] === undefined) {
        if (!force) {
          errors.push({
            kind: 'error',
            text: `rm: cannot remove '${requestedPath}': No such file or directory`,
          })
        }
        continue
      }
      deletes.push(path)
    }

    return { clear: false, close: false, lines: errors, deletes }
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
        content:
          path === 'New Buffer'
            ? ''
            : (readVirtualFile(path, context.virtualFiles) ?? ''),
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
    return nested.lines.length ||
      nested.screen ||
      nested.writes?.length ||
      nested.deletes?.length ||
      nested.clear ||
      nested.close
      ? nested
      : error('exec: comando no disponible en el entorno virtual')
  }

  return error(`${name}: comando no encontrado`)
}

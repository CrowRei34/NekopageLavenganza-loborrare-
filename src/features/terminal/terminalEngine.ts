import type { TerminalLine } from '../../core/model/types'

export interface TerminalContext {
  workspaceNumber: number
  workspaceName: string
}

export interface TerminalResult {
  clear: boolean
  lines: Array<Pick<TerminalLine, 'kind' | 'text'>>
}

const output = (text: string): TerminalResult => ({
  clear: false,
  lines: [{ kind: 'output', text }],
})

export const executeTerminalCommand = (
  rawCommand: string,
  context: TerminalContext,
): TerminalResult => {
  const command = rawCommand.trim()
  const [name, ...args] = command.split(/\s+/)

  if (!command) return { clear: false, lines: [] }
  if (name === 'clear') return { clear: true, lines: [] }
  if (name === 'help') {
    return output('help  clear  mikufetch  pwd  ls  whoami  date  workspace  echo')
  }
  if (name === 'mikufetch' || name === 'neofetch') {
    return output(
      'nekovoid\n  kernel     web-core\n  compositor niri-inspired\n  workspace  ' +
        context.workspaceNumber,
    )
  }
  if (name === 'pwd') return output('/home/nekovoid')
  if (name === 'ls') return output('Desktop  Documents  Projects  README.md')
  if (name === 'whoami') return output('visitor')
  if (name === 'date') return output(new Date().toLocaleString('es-ES'))
  if (name === 'workspace') return output(`${context.workspaceNumber}: ${context.workspaceName}`)
  if (name === 'echo') return output(args.join(' '))

  return {
    clear: false,
    lines: [{ kind: 'error', text: `${name}: comando no encontrado` }],
  }
}

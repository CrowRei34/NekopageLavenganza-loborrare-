import { describe, expect, it } from 'vitest'
import { executeTerminalCommand } from './terminalEngine'

const context = { workspaceNumber: 2, workspaceName: 'niri' }

describe('executeTerminalCommand', () => {
  it('returns deterministic local commands', () => {
    expect(executeTerminalCommand('pwd', context).lines[0].text).toBe('/home/nekovoid')
    expect(executeTerminalCommand('workspace', context).lines[0].text).toBe('2: niri')
    expect(executeTerminalCommand('echo hello world', context).lines[0].text).toBe('hello world')
  })

  it('offers mikufetch as the system-info command', () => {
    expect(executeTerminalCommand('help', context).lines[0].text).toContain('mikufetch')
    expect(executeTerminalCommand('mikufetch', context).lines[0].text).toContain('nekovoid')
  })

  it('supports clearing without executing anything on the host', () => {
    expect(executeTerminalCommand('clear', context)).toEqual({ clear: true, lines: [] })
    expect(executeTerminalCommand('rm -rf /', context).lines[0].kind).toBe('error')
  })
})

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
    expect(executeTerminalCommand('help', context).lines[0].text).toContain('htop')
    expect(executeTerminalCommand('mikufetch', context).lines[0].kind).toBe('fetch')
  })

  it('supports clear aliases and closes the terminal with exit', () => {
    expect(executeTerminalCommand('clear', context)).toEqual({
      clear: true,
      close: false,
      lines: [],
    })
    expect(executeTerminalCommand('cls', context).clear).toBe(true)
    expect(executeTerminalCommand('exit', context).close).toBe(true)
  })

  it('supports directory, system, and virtual-file commands', () => {
    expect(executeTerminalCommand('dir', context).lines[0].text).toContain('README.md')
    expect(executeTerminalCommand('uname -a', context).lines[0].text).toContain('NekoVoid')
    expect(executeTerminalCommand('cat /etc/os-release', context).lines[0].text).toContain(
      'PRETTY_NAME="Neko Void Linux',
    )
    expect(executeTerminalCommand('bat /etc/hostname', context).screen).toEqual({
      kind: 'bat',
      path: '/etc/hostname',
      content: 'nekovoid',
    })
    expect(executeTerminalCommand('bat --plain /etc/hostname', context).lines[0].text).toBe(
      'nekovoid',
    )
    expect(
      executeTerminalCommand("awk '{print $1}' /etc/os-release", context).lines[0].text,
    ).toContain('NAME="Neko')
  })

  it('provides safe simulations for interactive and process commands', () => {
    expect(executeTerminalCommand('nano README.md', context).screen).toEqual({
      kind: 'nano',
      path: 'README.md',
      content: 'Bienvenido a Neko Void.\nEste es un escritorio web inspirado en Niri.',
    })
    expect(executeTerminalCommand('top', context).screen?.kind).toBe('top')
    expect(executeTerminalCommand('htop', context).screen?.kind).toBe('htop')
    expect(executeTerminalCommand('exec uname -a', context).lines[0].text).toContain(
      'Linux nekovoid',
    )
  })

  it('does not access host files or execute unknown commands', () => {
    expect(executeTerminalCommand('rm -rf /', context).lines[0].kind).toBe('error')
    expect(executeTerminalCommand('cat /etc/shadow', context).lines[0].kind).toBe('error')
  })
})

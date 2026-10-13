import { describe, expect, it } from 'vitest'
import { executeTerminalCommand } from './terminalEngine'

const context = { workspaceNumber: 2, workspaceName: 'niri' }

describe('executeTerminalCommand', () => {
  it('returns deterministic local commands', () => {
    expect(executeTerminalCommand('pwd', context).lines[0].text).toBe('/home/nekovoid')
    expect(executeTerminalCommand('workspace', context).lines[0].text).toBe('2: niri')
    expect(executeTerminalCommand('echo hello world', context).lines[0].text).toBe('hello world')
    expect(executeTerminalCommand('echo "hiku" >> hehe.txt', context)).toMatchObject({
      lines: [],
      writes: [{ path: '/home/nekovoid/hehe.txt', content: 'hiku' }],
    })
    expect(executeTerminalCommand('echo "hiku" >> /etc/os-release', context)).toMatchObject({
      lines: [{ kind: 'error', text: 'bash: /etc/os-release: Permission denied' }],
    })
  })

  it('offers mikufetch as the system-info command', () => {
    expect(executeTerminalCommand('help', context).lines[0].text).toBe(
      'help  clear  cls  mikufetch  pwd  ls  dir  whoami  date  workspace  echo  uname  cat  bat  rm  nano  top  htop  btop  awk  exec  exit',
    )
    expect(executeTerminalCommand('help', context).lines[0].text).toContain('htop')
    expect(executeTerminalCommand('mikufetch', context).lines[0].kind).toBe('fetch')
  })

  it('supports clear aliases and closes the terminal with exit', () => {
    const clearResult = executeTerminalCommand('clear', context)
    const clsResult = executeTerminalCommand('cls', context)

    expect(clearResult).toEqual({
      clear: true,
      close: false,
      lines: [],
    })
    expect(clsResult).toEqual(clearResult)
    expect(executeTerminalCommand('exit', context).close).toBe(true)
  })

  it('supports directory, system, and virtual-file commands', () => {
    expect(executeTerminalCommand('ls', context).lines[0].text).toBe(
      'Desktop  Documents  Projects  README.md',
    )
    expect(executeTerminalCommand('dir', context).lines[0].text).toBe(
      executeTerminalCommand('ls', context).lines[0].text,
    )
    expect(executeTerminalCommand('dir -la', context).lines[0].text).toBe(
      executeTerminalCommand('ls -la', context).lines[0].text,
    )
    expect(
      executeTerminalCommand('ls', {
        ...context,
        virtualFiles: { '/home/nekovoid/hehe.txt': 'hiku' },
      }).lines[0].text,
    ).toBe('Desktop  Documents  Projects  README.md  hehe.txt')
    expect(executeTerminalCommand('ls --help', context).lines[0].text).toContain(
      'Usage: ls [OPTION]... [FILE]...',
    )
    expect(executeTerminalCommand('dir --help', context).lines[0].text).toContain(
      'Usage: dir [OPTION]... [FILE]...',
    )
    expect(executeTerminalCommand('uname -a', context).lines[0].text).toContain('NekoVoid')
    expect(executeTerminalCommand('cat /etc/os-release', context).lines[0].text).toContain(
      'PRETTY_NAME="Neko Void Linux',
    )
    expect(executeTerminalCommand('bat /etc/hostname', context).lines[0]).toEqual({
      kind: 'bat',
      path: '/etc/hostname',
      text: 'nekovoid',
    })
    expect(executeTerminalCommand('bat --plain /etc/hostname', context).lines[0].text).toBe(
      'nekovoid',
    )
    expect(executeTerminalCommand('bat -pp /etc/hostname', context).lines[0].text).toBe('nekovoid')
    expect(executeTerminalCommand('bat --help', context).lines[0].text).toContain(
      'Usage: bat [OPTIONS] [FILE]...',
    )
    expect(executeTerminalCommand('bat --version', context).lines[0].text).toBe('bat 0.26.1')
    expect(
      executeTerminalCommand('bat README.md', {
        ...context,
        virtualFiles: {
          '/home/nekovoid/README.md': Array.from(
            { length: 25 },
            (_, index) => `line ${index + 1}`,
          ).join('\n'),
        },
      }).screen?.kind,
    ).toBe('bat')
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

  it('removes user-created files but protects default files', () => {
    const withUserFile = {
      ...context,
      virtualFiles: { '/home/nekovoid/hehe.txt': 'hiku' },
    }

    expect(executeTerminalCommand('rm hehe.txt', withUserFile)).toMatchObject({
      lines: [],
      deletes: ['/home/nekovoid/hehe.txt'],
    })
    expect(executeTerminalCommand('rm README.md', withUserFile).lines[0].text).toBe(
      "rm: cannot remove 'README.md': Permission denied",
    )
    expect(executeTerminalCommand('rm /etc/os-release', withUserFile).lines[0].text).toBe(
      "rm: cannot remove '/etc/os-release': Permission denied",
    )
    expect(executeTerminalCommand('rm --help', withUserFile).lines[0]).toMatchObject({
      kind: 'output',
      text: expect.stringContaining('Usage: rm [OPTION]... [FILE]...'),
    })
    expect(executeTerminalCommand('rm --help', withUserFile).lines[0].text).toContain(
      'By default, rm does not remove directories.',
    )
    expect(executeTerminalCommand('rm --version', withUserFile).lines[0].text).toContain(
      'rm (GNU coreutils)',
    )
  })
})

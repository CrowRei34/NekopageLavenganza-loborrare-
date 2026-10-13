import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TerminalApp } from './TerminalApp'

describe('TerminalApp', () => {
  it('starts empty and keeps the prompt directly after command output', () => {
    const { container } = render(<TerminalApp windowId="terminal-layout-test" />)
    const output = container.querySelector('.terminal-output')
    const logo = container.querySelector('.terminal-pfetch__logo')
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })

    expect(output).not.toBeNull()
    expect(logo).toHaveAttribute('role', 'img')
    expect(logo?.textContent).toContain('▄')
    expect(logo?.querySelectorAll('span[style]').length).toBeGreaterThan(0)
    expect(logo?.querySelector('[style*="background-color"]')).not.toBeNull()
    expect(logo?.querySelector('[style*="--tui-accent-primary"]')).not.toBeNull()
    expect(logo?.querySelector('[style*="--tui-bg"]')).not.toBeNull()
    expect(logo?.querySelector('[style*="--tui-fg"]')).not.toBeNull()
    expect(output?.querySelector('.terminal-line')).toBeNull()
    expect(output?.querySelector('.terminal-input')).not.toBeNull()
    expect(container.querySelector('.window-chrome')).toBeNull()

    fireEvent.change(input, { target: { value: 'pwd' } })
    fireEvent.submit(input.closest('form')!)

    expect(output?.querySelectorAll('.terminal-line')).toHaveLength(2)
    expect(output?.textContent).toContain('[neko-void ~]$ pwd')
    expect(output?.textContent).toContain('/home/nekovoid')
    expect(output?.lastElementChild).toHaveClass('terminal-input')

    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.submit(input.closest('form')!)
    expect(output?.querySelector('.terminal-line')).toBeNull()
    expect(container.querySelector('.terminal-pfetch')).toBeInTheDocument()
  })

  it('opens the nano screen, saves a virtual file, and reads it back with cat', () => {
    const { container } = render(<TerminalApp windowId="terminal-nano-test" />)
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })
    const form = input.closest('form')!

    fireEvent.change(input, { target: { value: 'nano README.md' } })
    fireEvent.submit(form)

    const editor = screen.getByRole('textbox', { name: 'Contenido de README.md' })
    expect(container.querySelector('.nano-title')).toHaveTextContent('GNU nano')
    expect(container.querySelector('.terminal-pfetch')).toBeInTheDocument()
    fireEvent.change(editor, { target: { value: 'Neko Void\nTerminal de prueba' } })
    fireEvent.keyDown(editor, { key: 'o', ctrlKey: true })
    expect(screen.getByRole('status')).toHaveTextContent('Wrote 2 lines')
    fireEvent.keyDown(editor, { key: 'x', ctrlKey: true })

    const shellInput = screen.getByRole('textbox', { name: 'Comando de terminal' })
    fireEvent.change(shellInput, { target: { value: 'cat README.md' } })
    fireEvent.submit(shellInput.closest('form')!)
    expect(container.querySelector('.terminal-output')).toHaveTextContent('Terminal de prueba')
  })

  it('renders process monitors as interactive terminal screens', () => {
    const { container } = render(<TerminalApp windowId="terminal-htop-test" />)
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })
    fireEvent.change(input, { target: { value: 'htop' } })
    fireEvent.submit(input.closest('form')!)

    expect(container.querySelector('.terminal-tui--htop')).toBeInTheDocument()
    expect(container.querySelector('.terminal-pfetch')).toBeInTheDocument()
    expect(container.querySelector('.process-table__row')).toHaveTextContent('nekovoid')
    expect(container.querySelector('.htop-footer')).toHaveTextContent('F10 Quit')
    expect(container.querySelector('.process-table')).toHaveTextContent('runit')
    expect(container.querySelector('.process-table')).toHaveTextContent('noctalia-shell')
    expect(container.querySelector('.process-table')).not.toHaveTextContent('systemd')
    expect(container.querySelector('.process-table')).not.toHaveTextContent('waybar')
    const htop = container.querySelector('.terminal-tui--htop')!
    fireEvent.keyDown(htop, { key: 'F4' })
    expect(screen.getByRole('dialog', { name: 'Filtrar procesos' })).toBeInTheDocument()
    const filterInput = screen.getByRole('textbox', { name: 'Filtrar procesos' })
    fireEvent.change(filterInput, { target: { value: 'niri' } })
    fireEvent.keyDown(filterInput, { key: 'Enter' })
    expect(container.querySelectorAll('.process-table__row')).toHaveLength(1)
    fireEvent.keyDown(htop, { key: 'F10' })
    expect(container.querySelector('.terminal-tui--htop')).toBeNull()
  })

  it('opens an interactive btop dashboard and quits it with q', () => {
    const { container } = render(<TerminalApp windowId="terminal-btop-test" />)
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })
    fireEvent.change(input, { target: { value: 'btop' } })
    fireEvent.submit(input.closest('form')!)

    const btop = container.querySelector('.terminal-tui--btop')!
    expect(btop).toHaveTextContent('CPU')
    expect(btop).toHaveTextContent('MEMORY')
    expect(btop).toHaveTextContent('NETWORK')
    expect(btop).toHaveTextContent('DISKS')
    fireEvent.keyDown(btop, { key: '?' })
    expect(screen.getByRole('dialog', { name: 'Ayuda de btop' })).toBeInTheDocument()
    fireEvent.keyDown(btop, { key: 'Escape' })
    fireEvent.keyDown(btop, { key: 'q' })
    expect(container.querySelector('.terminal-tui--btop')).toBeNull()
  })

  it('opens the decorated bat pager and quits it with q', () => {
    const { container } = render(<TerminalApp windowId="terminal-bat-test" />)
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })
    fireEvent.change(input, { target: { value: 'bat /etc/os-release' } })
    fireEvent.submit(input.closest('form')!)

    const pager = container.querySelector('.bat-pager')
    expect(pager).toBeInTheDocument()
    expect(pager).toHaveTextContent('PRETTY_NAME')
    expect(pager?.querySelector('.bat-line__number')).toHaveTextContent('1')
    fireEvent.keyDown(pager!, { key: 'q' })
    expect(container.querySelector('.bat-pager')).toBeNull()
    expect(screen.getByRole('textbox', { name: 'Comando de terminal' })).toBeInTheDocument()
  })

  it('focuses its Niri column when the terminal is clicked or receives keyboard focus', () => {
    const onFocus = vi.fn()
    const { container } = render(<TerminalApp windowId="terminal-focus-test" onFocus={onFocus} />)
    const terminal = container.querySelector('.terminal-window')!
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })

    fireEvent.pointerDown(terminal)
    expect(onFocus).toHaveBeenCalled()
    onFocus.mockClear()
    fireEvent.focus(input)
    expect(onFocus).toHaveBeenCalled()
  })

  it('renders the mikufetch command using the same pixel fetch as the persistent banner', () => {
    const { container } = render(<TerminalApp windowId="terminal-fetch-command-test" />)
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })
    fireEvent.change(input, { target: { value: 'mikufetch' } })
    fireEvent.submit(input.closest('form')!)

    expect(container.querySelectorAll('.terminal-pfetch')).toHaveLength(2)
    expect(container.querySelectorAll('.terminal-pfetch__logo')).toHaveLength(2)
    expect(container.querySelector('.terminal-output')).toHaveTextContent(
      '[neko-void ~]$ mikufetch',
    )
    expect(container.querySelector('.terminal-output')).not.toHaveTextContent('kernel     web-core')
  })
})

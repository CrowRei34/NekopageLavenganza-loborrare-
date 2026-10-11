import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TerminalApp } from './TerminalApp'

describe('TerminalApp', () => {
  it('starts empty and keeps the prompt directly after command output', () => {
    const { container } = render(<TerminalApp windowId="terminal-layout-test" />)
    const output = container.querySelector('.terminal-output')
    const input = screen.getByRole('textbox', { name: 'Comando de terminal' })

    expect(output).not.toBeNull()
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
  })
})

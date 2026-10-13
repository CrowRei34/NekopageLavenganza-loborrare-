import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the initial Nekovoid desktop', () => {
    const { container } = render(<App />)

    expect(container.querySelector('.nekovoid')).toHaveAttribute(
      'data-color-scheme',
      'nekovoid-original',
    )
    expect(screen.queryByRole('navigation', { name: 'Workspaces' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Página oficial de Neko Void' })).toHaveAttribute(
      'href',
      'https://www.neko-void-linux.online/',
    )
    expect(screen.getByRole('link', { name: 'Comunidad de Neko Void en Discord' })).toHaveAttribute(
      'href',
      'https://discord.com/invite/8HvMHypRrP',
    )
    expect(screen.getByLabelText('Idioma actual: español')).toHaveTextContent('ES')
    expect(screen.getByText('Simplicity is prerequisite for reliability')).toBeInTheDocument()
    expect(screen.getByText('SESSION 01 / WELCOME')).toBeInTheDocument()
    expect(screen.getByText('Void Linux listo para explorar.')).toBeInTheDocument()
    expect(screen.getAllByRole('textbox', { name: 'Comando de terminal' })).toHaveLength(1)
    expect(screen.getByText('SHIFT + RUEDA')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Descargas y recursos de Neko Void' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Descargar edición recomendada' })).toHaveAttribute(
      'href',
      'https://huggingface.co/buckets/arepaconcafe/neko-base-bucket/resolve/nekovoid-mate-20260921.iso',
    )
    expect(screen.getByRole('link', { name: 'Wiki' })).toHaveAttribute(
      'href',
      'https://wiki.neko-void-linux.online/',
    )
  })

  it('opens another terminal from the top bar in the active workspace', () => {
    render(<App />)
    const terminalInputsBefore = screen.getAllByRole('textbox', { name: 'Comando de terminal' })

    fireEvent.click(screen.getByRole('button', { name: 'Abrir terminal' }))

    expect(screen.getAllByRole('textbox', { name: 'Comando de terminal' })).toHaveLength(
      terminalInputsBefore.length + 1,
    )
  })

  it('keeps wheel scrolling inside the wallpaper picker from changing workspace', () => {
    const { container } = render(<App />)
    const desktop = container.querySelector('.nekovoid')

    const wallpaperToggle = screen.getByRole('button', { name: 'Cambiar fondo de pantalla' })
    fireEvent.pointerDown(wallpaperToggle)
    fireEvent.click(wallpaperToggle)
    const picker = screen.getByRole('region', { name: 'Fondos de pantalla' })
    const activeWorkspaceBeforeScroll = desktop?.getAttribute('data-active-workspace')

    fireEvent.wheel(picker, { deltaY: 120 })

    expect(desktop).toHaveAttribute('data-active-workspace', activeWorkspaceBeforeScroll)
  })

  it('opens the desktop index and jumps to a selected workspace', () => {
    const { container } = render(<App />)
    const desktop = container.querySelector('.nekovoid')

    const indexToggle = screen.getByRole('button', { name: 'Índice de escritorios' })
    fireEvent.pointerDown(indexToggle)
    fireEvent.click(indexToggle)
    expect(screen.getByRole('navigation', { name: 'Ir a un escritorio' })).toBeInTheDocument()
    expect(screen.getByText('ÍNDICE / CONTENIDO')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ir al escritorio 04: gaming' }))

    expect(desktop).toHaveAttribute('data-active-workspace', 'workspace-4')
    const gamingWorkspace = screen.getByRole('region', { name: 'Workspace 4: gaming' })
    expect(
      within(gamingWorkspace).queryByRole('textbox', { name: 'Comando de terminal' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Ir a un escritorio' })).not.toBeInTheDocument()
  })

  it('keeps the desktop index and wallpaper picker mutually exclusive', () => {
    render(<App />)

    const indexToggle = screen.getByRole('button', { name: 'Índice de escritorios' })
    fireEvent.click(indexToggle)
    expect(screen.getByRole('navigation', { name: 'Ir a un escritorio' })).toBeInTheDocument()

    const wallpaperToggle = screen.getByRole('button', { name: 'Cambiar fondo de pantalla' })
    fireEvent.pointerDown(wallpaperToggle)
    fireEvent.click(wallpaperToggle)
    expect(screen.queryByRole('navigation', { name: 'Ir a un escritorio' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Fondos de pantalla' })).toBeInTheDocument()

    fireEvent.pointerDown(indexToggle)
    fireEvent.click(indexToggle)
    expect(screen.queryByRole('region', { name: 'Fondos de pantalla' })).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Ir a un escritorio' })).toBeInTheDocument()
  })

  it('closes the desktop index with Escape and restores focus to its button', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Índice de escritorios' })

    fireEvent.click(toggle)
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('navigation', { name: 'Ir a un escritorio' })).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })
})

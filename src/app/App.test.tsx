import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the initial Nekovoid desktop', () => {
    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Workspaces' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir terminal' })).toBeInTheDocument()
    expect(screen.getByText('Simplicity is prerequisite for reliability')).toBeInTheDocument()

    const initialColumns = screen.getAllByLabelText(/^Columna /).length
    fireEvent.click(screen.getByRole('button', { name: 'Abrir terminal' }))
    expect(screen.getAllByLabelText(/^Columna /)).toHaveLength(initialColumns + 1)
  })
})

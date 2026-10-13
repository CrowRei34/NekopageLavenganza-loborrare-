import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initialState } from '../../core/model/initialState'
import { useNekovoidStore } from '../../state/useNekovoidStore'
import { ColumnStrip } from './ColumnStrip'

describe('ColumnStrip resizing', () => {
  beforeEach(() => useNekovoidStore.setState(initialState))

  it('lets the terminal column grow with the keyboard resize handle', () => {
    const workspace = initialState.workspaces[0]
    const { container, rerender } = render(<ColumnStrip workspace={workspace} />)
    const separator = screen.getByRole('separator', { name: 'Redimensionar columna de terminal' })
    const initialWidth = Number(separator.getAttribute('aria-valuenow'))

    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    rerender(<ColumnStrip workspace={useNekovoidStore.getState().workspaces[0]} />)

    expect(container.querySelector('[data-column-id="workspace-1-terminal"]')).toHaveStyle({
      flexBasis: `${initialWidth + 40}px`,
    })
  })
})

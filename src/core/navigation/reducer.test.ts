import { describe, expect, it } from 'vitest'
import { initialState } from '../model/initialState'
import { reduceNekovoid } from './reducer'

describe('reduceNekovoid', () => {
  it('moves through workspaces and clamps at both ends', () => {
    const workspaceTwo = reduceNekovoid(initialState, {
      type: 'focus-workspace',
      direction: 'next',
    })
    const workspaceOne = reduceNekovoid(workspaceTwo, {
      type: 'focus-workspace',
      direction: 'previous',
    })

    expect(workspaceTwo.activeWorkspaceId).toBe('workspace-2')
    expect(workspaceOne.activeWorkspaceId).toBe('workspace-1')
    expect(
      reduceNekovoid(workspaceOne, { type: 'focus-workspace', direction: 'previous' })
        .activeWorkspaceId,
    ).toBe('workspace-1')
  })

  it('moves columns without changing their order', () => {
    const next = reduceNekovoid(initialState, {
      type: 'focus-column',
      direction: 'next',
    })

    expect(next.workspaces[0].columns.map((column) => column.id)).toEqual([
      'workspace-1-info',
      'workspace-1-terminal',
    ])
    expect(next.workspaces[0].activeColumnId).toBe('workspace-1-terminal')
  })

  it('adds a terminal as a new column without resizing existing columns', () => {
    const next = reduceNekovoid(initialState, { type: 'open-terminal' })
    const workspace = next.workspaces[0]

    expect(workspace.columns).toHaveLength(3)
    expect(workspace.columns[0].width).toBe('wide')
    expect(workspace.columns[1].width).toBe('narrow')
    expect(workspace.columns[2].width).toBe('narrow')
    expect(workspace.activeColumnId).toBe(workspace.columns[2].id)
  })

  it('preserves the empty workspace at the end', () => {
    const afterClose = reduceNekovoid(initialState, {
      type: 'close-window',
      windowId: 'welcome-info',
    })

    expect(afterClose.workspaces.at(-1)?.isEmptyPlaceholder).toBe(true)
  })
})

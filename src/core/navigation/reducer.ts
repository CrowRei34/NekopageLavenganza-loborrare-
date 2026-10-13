import type { Column, NekovoidState, Workspace } from '../model/types'
import type { NekovoidCommand } from './commands'
import { assertStateInvariants } from '../invariants/assertState'

const cloneState = (state: NekovoidState): NekovoidState => ({
  ...state,
  workspaces: state.workspaces.map((workspace) => ({
    ...workspace,
    columns: workspace.columns.map((column) => ({
      ...column,
      windows: [...column.windows],
    })),
  })),
  terminalSessions: { ...state.terminalSessions },
  settings: { ...state.settings },
})

const activeWorkspace = (state: NekovoidState): Workspace => {
  const workspace = state.workspaces.find((item) => item.id === state.activeWorkspaceId)
  if (!workspace) throw new Error(`Unknown active workspace: ${state.activeWorkspaceId}`)
  return workspace
}

const workspaceIndex = (state: NekovoidState): number =>
  state.workspaces.findIndex((workspace) => workspace.id === state.activeWorkspaceId)

const withWorkspace = (state: NekovoidState, workspace: Workspace): void => {
  const index = state.workspaces.findIndex((item) => item.id === workspace.id)
  state.workspaces[index] = workspace
}

const stepIndex = (index: number, direction: 'next' | 'previous', length: number): number => {
  const delta = direction === 'next' ? 1 : -1
  return Math.max(0, Math.min(length - 1, index + delta))
}

const moveWorkspace = (state: NekovoidState, direction: 'next' | 'previous'): void => {
  const nextIndex = stepIndex(workspaceIndex(state), direction, state.workspaces.length)
  state.activeWorkspaceId = state.workspaces[nextIndex].id
}

const moveColumn = (state: NekovoidState, direction: 'next' | 'previous'): void => {
  const workspace = activeWorkspace(state)
  if (workspace.columns.length === 0 || workspace.activeColumnId === null) return

  const currentIndex = workspace.columns.findIndex(
    (column) => column.id === workspace.activeColumnId,
  )
  const nextIndex = stepIndex(currentIndex, direction, workspace.columns.length)
  const nextWorkspace = {
    ...workspace,
    activeColumnId: workspace.columns[nextIndex].id,
  }
  withWorkspace(state, nextWorkspace)
}

const focusColumn = (state: NekovoidState, columnId: string): void => {
  const workspace = activeWorkspace(state)
  if (!workspace.columns.some((column) => column.id === columnId)) return
  withWorkspace(state, { ...workspace, activeColumnId: columnId })
}

const resizeColumn = (
  state: NekovoidState,
  workspaceId: string,
  columnId: string,
  width: number,
): void => {
  const workspace = state.workspaces.find((item) => item.id === workspaceId)
  if (!workspace || !Number.isFinite(width)) return
  const customWidth = Math.max(320, Math.min(2400, Math.round(width)))
  withWorkspace(state, {
    ...workspace,
    columns: workspace.columns.map((column) =>
      column.id === columnId ? { ...column, customWidth } : column,
    ),
  })
}

const createTerminalColumn = (workspace: Workspace, serial: number): Column => ({
  id: `${workspace.id}-terminal-${serial}`,
  width: 'narrow',
  windows: [
    {
      id: `${workspace.id}-terminal-window-${serial}`,
      title: 'Terminal',
      kind: 'terminal',
    },
  ],
})

const openTerminal = (state: NekovoidState, requestedWorkspaceId?: string): void => {
  const workspaceId = requestedWorkspaceId ?? state.activeWorkspaceId
  const workspace = state.workspaces.find((item) => item.id === workspaceId)
  if (!workspace) return

  const serial = workspace.columns.length + 1
  const terminalColumn = createTerminalColumn(workspace, serial)
  const nextWorkspace = {
    ...workspace,
    columns: [...workspace.columns, terminalColumn],
    activeColumnId: terminalColumn.id,
    isEmptyPlaceholder: false,
  }

  withWorkspace(state, nextWorkspace)
  state.activeWorkspaceId = workspaceId
}

const closeWindow = (state: NekovoidState, windowId: string): void => {
  for (const workspace of state.workspaces) {
    const nextColumns = workspace.columns
      .map((column) => ({
        ...column,
        windows: column.windows.filter((window) => window.id !== windowId),
      }))
      .filter((column) => column.windows.length > 0)

    if (nextColumns.length !== workspace.columns.length) {
      const nextActiveColumnId =
        workspace.activeColumnId &&
        nextColumns.some((column) => column.id === workspace.activeColumnId)
          ? workspace.activeColumnId
          : (nextColumns[0]?.id ?? null)
      withWorkspace(state, {
        ...workspace,
        columns: nextColumns,
        activeColumnId: nextActiveColumnId,
        isEmptyPlaceholder: nextColumns.length === 0,
      })
      delete state.terminalSessions[windowId]
      return
    }
  }
}

export const reduceNekovoid = (state: NekovoidState, command: NekovoidCommand): NekovoidState => {
  const next = cloneState(state)

  switch (command.type) {
    case 'focus-workspace':
      moveWorkspace(next, command.direction)
      break
    case 'focus-workspace-index':
      if (next.workspaces.some((workspace) => workspace.id === command.workspaceId)) {
        next.activeWorkspaceId = command.workspaceId
      }
      break
    case 'focus-column':
      moveColumn(next, command.direction)
      break
    case 'focus-column-id':
      focusColumn(next, command.columnId)
      break
    case 'resize-column':
      resizeColumn(next, command.workspaceId, command.columnId, command.width)
      break
    case 'open-terminal':
      openTerminal(next, command.workspaceId)
      break
    case 'close-window':
      closeWindow(next, command.windowId)
      break
  }

  assertStateInvariants(next)
  return next
}

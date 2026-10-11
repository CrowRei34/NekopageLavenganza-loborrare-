import type { NekovoidState, Workspace } from '../model/types'

const assert: (condition: boolean, message: string) => asserts condition = (condition, message) => {
  if (!condition) {
    throw new Error(`Nekovoid invariant failed: ${message}`)
  }
}

const assertWorkspace = (workspace: Workspace): void => {
  const columnIds = new Set(workspace.columns.map((column) => column.id))
  assert(columnIds.size === workspace.columns.length, `duplicate columns in ${workspace.id}`)

  if (workspace.columns.length === 0) {
    assert(workspace.activeColumnId === null, `empty workspace ${workspace.id} has active column`)
    return
  }

  assert(
    workspace.activeColumnId !== null && columnIds.has(workspace.activeColumnId),
    `active column is missing in ${workspace.id}`,
  )

  const windowIds = workspace.columns.flatMap((column) => column.windows.map((window) => window.id))
  assert(new Set(windowIds).size === windowIds.length, `duplicate windows in ${workspace.id}`)
}

export const assertStateInvariants = (state: NekovoidState): void => {
  assert(state.workspaces.length > 0, 'there must be at least one workspace')
  assert(state.workspaces.at(-1)?.isEmptyPlaceholder === true, 'last workspace must be empty')
  assert(
    state.workspaces.some((workspace) => workspace.id === state.activeWorkspaceId),
    'active workspace is missing',
  )

  const workspaceIds = state.workspaces.map((workspace) => workspace.id)
  assert(new Set(workspaceIds).size === workspaceIds.length, 'duplicate workspaces')
  state.workspaces.forEach(assertWorkspace)
}

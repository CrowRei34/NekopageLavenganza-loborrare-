import type { NekovoidState } from '../model/types'

export const selectActiveWorkspace = (state: NekovoidState) =>
  state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ??
  state.workspaces[0]

export const selectActiveWorkspaceIndex = (state: NekovoidState) =>
  state.workspaces.findIndex((workspace) => workspace.id === state.activeWorkspaceId)

export const selectActiveColumn = (state: NekovoidState) => {
  const workspace = selectActiveWorkspace(state)
  return workspace.columns.find((column) => column.id === workspace.activeColumnId) ?? null
}

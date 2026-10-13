import type { WorkspaceId, WindowId } from '../model/types'

export type Direction = 'next' | 'previous'

export type NekovoidCommand =
  | { type: 'focus-workspace'; direction: Direction }
  | { type: 'focus-workspace-index'; workspaceId: WorkspaceId }
  | { type: 'focus-column'; direction: Direction }
  | { type: 'focus-column-id'; columnId: string }
  | { type: 'resize-column'; workspaceId: WorkspaceId; columnId: string; width: number }
  | { type: 'open-terminal'; workspaceId?: WorkspaceId }
  | { type: 'close-window'; windowId: WindowId }

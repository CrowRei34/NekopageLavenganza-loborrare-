export type WorkspaceId = string
export type ColumnId = string
export type WindowId = string

export type AppKind = 'info' | 'terminal'

export interface InfoDocument {
  eyebrow: string
  title: string
  body: string
  bullets: string[]
}

export interface WebWindow {
  id: WindowId
  title: string
  kind: AppKind
  info?: InfoDocument
}

export interface Column {
  id: ColumnId
  width: 'narrow' | 'medium' | 'wide'
  windows: WebWindow[]
}

export interface Workspace {
  id: WorkspaceId
  number: number
  name: string
  columns: Column[]
  activeColumnId: ColumnId | null
  isEmptyPlaceholder: boolean
}

export interface TerminalLine {
  id: number
  kind: 'input' | 'output' | 'error'
  text: string
}

export interface TerminalSession {
  lines: TerminalLine[]
  nextLineId: number
}

export interface NekovoidSettings {
  accent: 'mint' | 'violet'
  reducedMotion: boolean
}

export interface NekovoidState {
  workspaces: Workspace[]
  activeWorkspaceId: WorkspaceId
  terminalSessions: Record<WindowId, TerminalSession>
  settings: NekovoidSettings
}

import { create } from 'zustand'
import { reduceNekovoid } from '../core/navigation/reducer'
import type { NekovoidCommand } from '../core/navigation/commands'
import { initialState } from '../core/model/initialState'
import type { NekovoidState, TerminalLine, TerminalSession, WindowId } from '../core/model/types'

interface NekovoidStore extends NekovoidState {
  dispatch: (command: NekovoidCommand) => void
  setTerminalSession: (windowId: WindowId, session: TerminalSession) => void
}

export const useNekovoidStore = create<NekovoidStore>((set) => ({
  ...initialState,
  dispatch: (command) => set((state) => reduceNekovoid(state, command)),
  setTerminalSession: (windowId, session) =>
    set((state) => ({
      terminalSessions: {
        ...state.terminalSessions,
        [windowId]: session,
      },
    })),
}))

export const createTerminalSession = (): TerminalSession => ({
  lines: [],
  nextLineId: 0,
})

export const appendTerminalLines = (
  session: TerminalSession,
  lines: Array<Pick<TerminalLine, 'kind' | 'text'>>,
): TerminalSession => ({
  lines: [
    ...session.lines,
    ...lines.map((line, index) => ({
      ...line,
      id: session.nextLineId + index,
    })),
  ],
  nextLineId: session.nextLineId + lines.length,
})

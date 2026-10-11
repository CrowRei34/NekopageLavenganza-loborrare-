import { useNekovoidStore } from '../../state/useNekovoidStore'
import { selectActiveWorkspaceIndex } from '../../core/navigation/selectors'
import { Workspace } from './Workspace'

export const WorkspaceRail = () => {
  const workspaces = useNekovoidStore((state) => state.workspaces)
  const activeIndex = useNekovoidStore(selectActiveWorkspaceIndex)

  return (
    <main
      className="workspace-viewport"
      style={{ transform: `translateY(-${activeIndex * 100}%)` }}
      aria-live="polite"
    >
      {workspaces.map((workspace) => (
        <Workspace key={workspace.id} workspace={workspace} />
      ))}
    </main>
  )
}

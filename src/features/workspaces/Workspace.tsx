import type { Workspace as WorkspaceModel } from '../../core/model/types'
import { ColumnStrip } from '../columns/ColumnStrip'

interface WorkspaceProps {
  workspace: WorkspaceModel
}

export const Workspace = ({ workspace }: WorkspaceProps) => (
  <section className="workspace" aria-label={`Workspace ${workspace.number}: ${workspace.name}`}>
    <div className="workspace__meta">
      <span>{String(workspace.number).padStart(2, '0')}</span>
      <span>{workspace.name}</span>
    </div>
    <ColumnStrip workspace={workspace} />
  </section>
)

import type { Workspace } from '../../core/model/types'
import { PfetchLogo } from './PfetchLogo'

interface PfetchBlockProps {
  workspace: Pick<Workspace, 'number' | 'name'>
  showCommand?: boolean
  compact?: boolean
  inline?: boolean
}

const prompt = '[neko-void ~]$'

export const PfetchBlock = ({
  workspace,
  showCommand = true,
  compact = false,
  inline = false,
}: PfetchBlockProps) => (
  <section
    className={`terminal-pfetch${compact ? ' terminal-pfetch--compact' : ''}${inline ? ' terminal-pfetch--inline' : ''}`}
    aria-label={inline ? 'Salida de mikufetch' : 'Información del sistema'}
  >
    {showCommand && (
      <div className="terminal-pfetch__command" aria-hidden="true">
        <span className="terminal-prompt">{prompt}</span>{' '}
        <strong className="terminal-pfetch__command-name">mikufetch</strong>
      </div>
    )}
    <PfetchLogo />
    <div className="terminal-pfetch__details">
      <strong>neko-void</strong>
      <span className="terminal-pfetch__rule" />
      <span>
        <b>OS</b> Neko Void Linux
      </span>
      <span>
        <b>WM</b> Niri-inspired
      </span>
      <span>
        <b>Shell</b> neko-shell
      </span>
      <span>
        <b>Workspace</b> {String(workspace.number).padStart(2, '0')} — {workspace.name}
      </span>
    </div>
  </section>
)

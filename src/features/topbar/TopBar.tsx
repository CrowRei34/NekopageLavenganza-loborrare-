import { useCallback, useState } from 'react'
import { BarIcon } from './BarIcon'
import { WallpaperPicker } from '../wallpaper/WallpaperPicker'
import { WorkspaceIndex } from '../workspaces/WorkspaceIndex'
import type { WallpaperId } from '../wallpaper/catalog'
import { useNekovoidStore } from '../../state/useNekovoidStore'

type TopBarPopover = 'index' | 'wallpapers' | null

interface TopBarProps {
  selectedWallpaper: WallpaperId
  onWallpaperSelect: (wallpaperId: WallpaperId) => void
}

export const TopBar = ({ selectedWallpaper, onWallpaperSelect }: TopBarProps) => {
  const dispatch = useNekovoidStore((state) => state.dispatch)
  const [openPopover, setOpenPopover] = useState<TopBarPopover>(null)
  const togglePopover = useCallback((popover: Exclude<TopBarPopover, null>) => {
    setOpenPopover((current) => (current === popover ? null : popover))
  }, [])
  const closePopover = useCallback(() => setOpenPopover(null), [])

  return (
    <header className="topbar">
      <div className="topbar__left">
        <WorkspaceIndex
          isOpen={openPopover === 'index'}
          onToggle={() => togglePopover('index')}
          onClose={closePopover}
        />
        <WallpaperPicker
          selectedWallpaper={selectedWallpaper}
          onSelect={onWallpaperSelect}
          isOpen={openPopover === 'wallpapers'}
          onToggle={() => togglePopover('wallpapers')}
          onClose={closePopover}
        />
      </div>
      <div className="topbar__center" aria-hidden="true">
        <span />
      </div>
      <div className="topbar__right">
        <button
          className="bar-link terminal-trigger"
          type="button"
          aria-label="Abrir terminal"
          title="Abrir terminal"
          onClick={() => dispatch({ type: 'open-terminal' })}
        >
          <BarIcon name="terminal" />
        </button>
        <a
          className="bar-link"
          href="https://www.neko-void-linux.online/"
          target="_blank"
          rel="noreferrer"
          aria-label="Página oficial de Neko Void"
          title="Neko Void"
        >
          <BarIcon name="waves" />
        </a>
        <a
          className="bar-link"
          href="https://discord.com/invite/8HvMHypRrP"
          target="_blank"
          rel="noreferrer"
          aria-label="Comunidad de Neko Void en Discord"
          title="Discord"
        >
          <BarIcon name="discord" />
        </a>
        <span className="bar-locale" aria-label="Idioma actual: español">
          <BarIcon name="globe" />
          <span>ES</span>
          <BarIcon name="chevron" />
        </span>
      </div>
    </header>
  )
}

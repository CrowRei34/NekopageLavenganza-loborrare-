import { useEffect, useMemo, useRef, useState } from 'react'
import { BarIcon } from '../topbar/BarIcon'
import { wallpapers, type WallpaperId } from './catalog'

interface WallpaperPickerProps {
  selectedWallpaper: WallpaperId
  onSelect: (wallpaperId: WallpaperId) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export const WallpaperPicker = ({
  selectedWallpaper,
  onSelect,
  isOpen,
  onToggle,
  onClose,
}: WallpaperPickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<{ focus: () => void } | null>(null)
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'all' | 'credited'>('all')

  const visibleWallpapers = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    return wallpapers.filter((wallpaper) => {
      const hasCreator = Boolean(wallpaper.creator)
      const matchesSource = source === 'all' || hasCreator
      const searchText = `${wallpaper.name} ${wallpaper.palette.name} ${wallpaper.creator ?? ''}`
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      return matchesSource && searchText.includes(normalizedQuery)
    })
  }, [query, source])

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsidePointer = (event: Parameters<typeof window.dispatchEvent>[0]) => {
      if (!rootRef.current?.contains(event.target as HTMLElement)) onClose()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onClose()
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onClose])

  return (
    <div className="wallpaper-picker" ref={rootRef}>
      <button
        className="bar-symbol"
        type="button"
        aria-label="Cambiar fondo de pantalla"
        aria-expanded={isOpen}
        aria-controls="wallpaper-picker-panel"
        title="Fondo de pantalla"
        ref={(element) => {
          triggerRef.current = element
        }}
        onClick={onToggle}
      >
        <BarIcon name="window" />
      </button>
      {isOpen && (
        <section
          className="wallpaper-picker__panel"
          id="wallpaper-picker-panel"
          aria-label="Fondos de pantalla"
          data-wheel-consumer="true"
        >
          <div className="wallpaper-picker__toolbar">
            <div className="wallpaper-picker__heading">
              <span>FONDO DE PANTALLA</span>
              <span>
                {String(visibleWallpapers.length).padStart(2, '0')} /{' '}
                {String(wallpapers.length).padStart(2, '0')}
              </span>
            </div>
            <label className="wallpaper-picker__search">
              <input
                type="search"
                aria-label="Filtrar fondos"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Filtrar…"
              />
            </label>
            <div
              className="wallpaper-picker__filters"
              role="group"
              aria-label="Filtrar por atribución"
            >
              {(
                [
                  ['all', 'Todos'],
                  ['credited', 'Con autor'],
                ] as const
              ).map(([value, label]) => (
                <button
                  className={
                    source === value
                      ? 'wallpaper-picker__filter wallpaper-picker__filter--active'
                      : 'wallpaper-picker__filter'
                  }
                  type="button"
                  key={value}
                  aria-pressed={source === value}
                  onClick={() => setSource(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="wallpaper-picker__close"
              type="button"
              aria-label="Cerrar selector de fondos"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          {visibleWallpapers.length > 0 ? (
            <div className="wallpaper-picker__options" role="group" aria-label="Elegir fondo">
              {visibleWallpapers.map((wallpaper) => (
                <article
                  className={`wallpaper-option ${selectedWallpaper === wallpaper.id ? 'wallpaper-option--selected' : ''}`}
                  key={wallpaper.id}
                >
                  <button
                    className="wallpaper-option__select"
                    type="button"
                    aria-pressed={selectedWallpaper === wallpaper.id}
                    aria-label={`${wallpaper.name}, ${selectedWallpaper === wallpaper.id ? 'actual' : 'usar fondo'}`}
                    aria-description={`${wallpaper.creator ? `Arte: ${wallpaper.creator}. ` : ''}Esquema: ${wallpaper.palette.name}.`}
                    onClick={() => {
                      onSelect(wallpaper.id)
                      onClose()
                    }}
                  >
                    <img src={wallpaper.thumbnail} alt="" loading="lazy" />
                    <span className="wallpaper-option__name">{wallpaper.name}</span>
                    <span className="wallpaper-option__state">
                      {selectedWallpaper === wallpaper.id ? 'ACTUAL' : 'USAR'}
                    </span>
                    <span className="wallpaper-option__palette">{wallpaper.palette.name}</span>
                  </button>
                  {wallpaper.creator && wallpaper.creatorLink && (
                    <a
                      className="wallpaper-option__creator"
                      href={wallpaper.creatorLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir ${wallpaper.creatorLinkName} en una pestaña nueva`}
                    >
                      Arte: {wallpaper.creator} ↗
                    </a>
                  )}
                  {wallpaper.creator && !wallpaper.creatorLink && (
                    <span className="wallpaper-option__creator">Arte: {wallpaper.creator}</span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="wallpaper-picker__empty" role="status">
              No hay fondos que coincidan con “{query}”.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

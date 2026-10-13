import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { wallpapers } from './catalog'
import { WallpaperPicker } from './WallpaperPicker'

const WallpaperPickerHarness = ({
  selectedWallpaper,
  onSelect,
}: {
  selectedWallpaper: string
  onSelect: (wallpaperId: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <WallpaperPicker
      selectedWallpaper={selectedWallpaper}
      onSelect={onSelect}
      isOpen={isOpen}
      onToggle={() => setIsOpen((open) => !open)}
      onClose={() => setIsOpen(false)}
    />
  )
}

describe('WallpaperPicker', () => {
  it('marks the complete wallpaper catalog as official', () => {
    expect(wallpapers.every((wallpaper) => wallpaper.source === 'official')).toBe(true)
  })

  it('shows the original wallpaper first with its matching community palette', () => {
    const onSelect = vi.fn()

    render(<WallpaperPickerHarness selectedWallpaper="neko-kyokowallpaper" onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    const originalWallpaper = screen.getByRole('button', { name: 'Original, usar fondo' })

    expect(wallpapers[0]?.id).toBe('original')
    expect(originalWallpaper).toHaveAttribute(
      'aria-description',
      'Arte: Ronin Velvet. Esquema: Neko Void original.',
    )
    expect(originalWallpaper).not.toHaveAttribute('title')
    fireEvent.click(originalWallpaper)

    expect(onSelect).toHaveBeenCalledWith('original')
  })

  it('opens the wallpaper choices and selects the original wallpaper', () => {
    const onSelect = vi.fn()

    render(
      <WallpaperPickerHarness
        selectedWallpaper="neko-kyokowallpaper-dark-jp"
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    expect(screen.getByRole('region', { name: 'Fondos de pantalla' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Neko Kyoko Wallpaper, usar fondo' }))

    expect(onSelect).toHaveBeenCalledWith('neko-kyokowallpaper')
    expect(screen.queryByRole('region', { name: 'Fondos de pantalla' })).not.toBeInTheDocument()
  })

  it('selects one of the bundled wallpapers', () => {
    const onSelect = vi.fn()

    render(<WallpaperPickerHarness selectedWallpaper="neko-kyokowallpaper" onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    fireEvent.click(screen.getByRole('button', { name: 'Moony, usar fondo' }))

    expect(onSelect).toHaveBeenCalledWith(
      wallpapers.find((wallpaper) => wallpaper.name === 'Moony')?.id,
    )
    expect(screen.queryByRole('region', { name: 'Fondos de pantalla' })).not.toBeInTheDocument()
  })

  it('filters wallpapers by name or palette and by attribution', () => {
    render(<WallpaperPickerHarness selectedWallpaper="original" onSelect={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar fondos' }), {
      target: { value: 'matecito' },
    })

    expect(screen.getByRole('button', { name: /Edernity, usar fondo/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Original, actual' })).not.toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Edernity, usar fondo' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Con autor' }))
    expect(screen.getByRole('status')).toHaveTextContent('No hay fondos que coincidan')
  })

  it('removes the empty uncredited filter and closes from the gallery control', () => {
    render(<WallpaperPickerHarness selectedWallpaper="original" onSelect={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    expect(screen.queryByRole('button', { name: 'Sin autor' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Original, actual' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar selector de fondos' }))
    expect(screen.queryByRole('region', { name: 'Fondos de pantalla' })).not.toBeInTheDocument()
  })

  it('credits the original wallpaper to Ronin Velvet and links to their Ko-fi', () => {
    const wallpaper = wallpapers.find((item) => item.id === 'original')

    expect(wallpaper).toMatchObject({
      creator: 'Ronin Velvet',
      creatorLink: 'https://ko-fi.com/roninvelvet',
      creatorLinkName: 'Ko-fi de Ronin Velvet',
    })

    render(<WallpaperPickerHarness selectedWallpaper="original" onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    expect(
      screen.getByRole('link', { name: 'Abrir Ko-fi de Ronin Velvet en una pestaña nueva' }),
    ).toHaveAttribute('href', 'https://ko-fi.com/roninvelvet')
  })

  it('does not attribute Edernity to Ronin Velvet', () => {
    const wallpaper = wallpapers.find((item) => item.id === 'edernity')

    expect(wallpaper?.creator).toBeUndefined()
  })

  it('includes Kyouko Beach in the official collection with its sunset palette', () => {
    const onSelect = vi.fn()
    const beachWallpaper = wallpapers.find((wallpaper) => wallpaper.id === 'kyouko-beach')

    expect(beachWallpaper).toMatchObject({
      name: 'Kyouko Beach',
      source: 'official',
      palette: { name: 'Kyouko Sunset' },
      creator: 'hitcat',
      creatorLink: 'https://ko-fi.com/lu15ange7',
      creatorLinkName: 'Ko-fi de hitcat',
    })

    render(<WallpaperPickerHarness selectedWallpaper="original" onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))
    fireEvent.click(screen.getByRole('button', { name: 'Con autor' }))
    expect(
      screen.getByRole('link', { name: 'Abrir Ko-fi de Ronin Velvet en una pestaña nueva' }),
    ).toHaveAttribute('href', 'https://ko-fi.com/roninvelvet')
    expect(
      screen.getByRole('link', { name: 'Abrir Ko-fi de hitcat en una pestaña nueva' }),
    ).toHaveAttribute('href', 'https://ko-fi.com/lu15ange7')
    fireEvent.click(screen.getByRole('button', { name: 'Kyouko Beach, usar fondo' }))

    expect(onSelect).toHaveBeenCalledWith('kyouko-beach')
  })

  it('credits Era Dark on the Kyoto Kyouko artwork', () => {
    render(<WallpaperPickerHarness selectedWallpaper="original" onSelect={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar fondo de pantalla' }))

    const artwork = screen.getByRole('button', { name: 'Kyoko In Kioto, usar fondo' })
    expect(artwork).toHaveAttribute('aria-description', 'Arte: Era Dark. Esquema: Cherry Blossom.')
    const creatorLink = artwork.closest('article')?.querySelector('a')
    expect(creatorLink).toHaveAccessibleName('Abrir Linktree de Era Dark en una pestaña nueva')
    expect(creatorLink).toHaveAttribute('href', 'https://linktr.ee/DARKK_ERA')
    expect(creatorLink).toHaveTextContent('Arte: Era Dark')
  })

  it('credits Era Dark on the additional Kyouko wallpapers', () => {
    const eraDarkNames = [
      'Kyoko32586230',
      'Kyokojsfjsa',
      'Kyokosafsaf',
      'Neko Kyoko Wallpaper',
      'Neko Kyoko Wallpaper Blue Jp',
      'Neko Kyoko Wallpaper Dark Jp',
      'Neko Kyoko Wallpaper Green Jp',
      'Neko Kyoko Wallpaper Prueba No Text',
      'Neko Kyoko Wallpaper Rose No Text',
      'Neko Kyoko Wallpaper Rose Jp',
      'Neko17',
    ]

    for (const name of eraDarkNames) {
      expect(wallpapers.find((wallpaper) => wallpaper.name === name)?.creator).toBe('Era Dark')
    }
  })

  it('credits Moony on the matching wallpapers without linking to Era Dark', () => {
    const moonyWallpaperIds = [
      'neko',
      'wall-moony-kyouko',
      'moony',
      'moony3',
      'moony-art',
      'moony-art2',
      'moony-art3',
    ]

    for (const id of moonyWallpaperIds) {
      const wallpaper = wallpapers.find((item) => item.id === id)
      expect(wallpaper?.creator).toBe('Moony')
      expect(wallpaper?.creatorLink).toBeUndefined()
    }
  })
})

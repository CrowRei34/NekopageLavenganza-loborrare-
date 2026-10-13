import { describe, expect, it } from 'vitest'
import { paletteForWallpaper } from './communityPalettes'

describe('wallpaper community palette pairing', () => {
  it('pairs pink Kyoto wallpapers with a pink community palette', () => {
    expect(paletteForWallpaper('kyouko-in-kioto-2').id).toBe('rose-pine-moon')
    expect(paletteForWallpaper('kyouko-in-kioto').id).toBe('cherry-blossom')
  })

  it('restores the original Nekovoid color scheme for the original wallpaper', () => {
    expect(paletteForWallpaper('original').id).toBe('nekovoid-original')
    expect(paletteForWallpaper('original').primary).toBe('#9DD2C0')
  })

  it('pairs the forest wallpaper with Noctalia Matecito', () => {
    expect(paletteForWallpaper('edernity').id).toBe('matecito')
    expect(paletteForWallpaper('edernity').primary).toBe('#8DA383')
    expect(paletteForWallpaper('edernity').secondary).toBe('#CB9B7C')
  })

  it('does not assign one palette to every wallpaper from the same art family', () => {
    expect(paletteForWallpaper('neko-kyokowallpaper-rose-jp').id).toBe('cherry-blossom')
    expect(paletteForWallpaper('moony-art').id).toBe('everforest')
    expect(paletteForWallpaper('moony-art2').id).toBe('rose-pine-moon')
  })

  it('pairs cool blue wallpapers with Oxocarbon and green/botanical ones with Everforest', () => {
    expect(paletteForWallpaper('neko-kyokowallpaper-blue-jp').id).toBe('oxocarbon')
    expect(paletteForWallpaper('neko-kyokowallpaper-dark-jp').id).toBe('oxocarbon')
    expect(paletteForWallpaper('neko-kyokowallpaper-green-jp').id).toBe('everforest')
    expect(paletteForWallpaper('kyouko-in-kioto-3').id).toBe('everforest')
  })
})

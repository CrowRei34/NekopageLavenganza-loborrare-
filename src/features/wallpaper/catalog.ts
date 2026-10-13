import { paletteForWallpaper, type CommunityPalette } from '../theme/communityPalettes'
import originalWallpaper from '../../assets/wallpapers/custom/full/original.webp'
import originalWallpaperThumbnail from '../../assets/wallpapers/custom/thumbs/original.webp'
import kyoukoBeachWallpaper from '../../assets/wallpapers/custom/full/kyouko-beach.webp'
import kyoukoBeachThumbnail from '../../assets/wallpapers/custom/thumbs/kyouko-beach.webp'

const fullSizeAssets = import.meta.glob<string>('../../assets/wallpapers/official/full/*.webp', {
  eager: true,
  import: 'default',
})

const thumbnailAssets = import.meta.glob<string>('../../assets/wallpapers/official/thumbs/*.webp', {
  eager: true,
  import: 'default',
})

const displayName = (fileName: string) =>
  fileName
    .replace(/kyokowallpaper/gi, 'kyoko wallpaper')
    .replace(/kyouko/gi, 'kyoko')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const eraDarkWallpapers = new Set([
  'kioto---kyoko-wallpaper',
  'kyouko-in-kioto',
  'kyouko-in-kioto-2',
  'kyouko-in-kioto-3',
  'kyouko-in-kioto-4',
  'kyoko12426426',
  'kyoko241',
  'kyoko2411',
  'kyoko32586230',
  'kyokojsfjsa',
  'kyokosafsaf',
  'neko-kyokowallpaper',
  'neko-kyokowallpaper-blue-jp',
  'neko-kyokowallpaper-dark-jp',
  'neko-kyokowallpaper-green-jp',
  'neko-kyokowallpaper-prueba-no-text',
  'neko-kyokowallpaper-rose-no-text',
  'neko-kyokowallpaper-rose-jp',
  'neko17',
])

const moonyWallpapers = new Set([
  'neko',
  'wall-moony-kyouko',
  'moony',
  'moony3',
  'moony-art',
  'moony-art2',
  'moony-art3',
])

const officialWallpapers = Object.entries(fullSizeAssets).map(([path, src]) => {
  const fileName =
    path
      .split('/')
      .pop()
      ?.replace(/\.webp$/i, '') ?? path
  const thumbnailPath = path.replace('/full/', '/thumbs/')
  const creator = eraDarkWallpapers.has(fileName)
    ? 'Era Dark'
    : moonyWallpapers.has(fileName)
      ? 'Moony'
      : undefined
  const creatorLink = creator === 'Era Dark' ? 'https://linktr.ee/DARKK_ERA' : undefined
  const creatorLinkName = creator === 'Era Dark' ? 'Linktree de Era Dark' : undefined

  return {
    id: fileName,
    name: displayName(fileName),
    source: 'official' as const,
    palette: paletteForWallpaper(fileName),
    creator,
    creatorLink,
    creatorLinkName,
    src,
    thumbnail: thumbnailAssets[thumbnailPath] ?? src,
  }
})

export const wallpapers = [
  {
    id: 'original',
    name: 'Original',
    source: 'official' as const,
    palette: paletteForWallpaper('original'),
    creator: 'Ronin Velvet',
    creatorLink: 'https://ko-fi.com/roninvelvet',
    creatorLinkName: 'Ko-fi de Ronin Velvet',
    src: originalWallpaper,
    thumbnail: originalWallpaperThumbnail,
  },
  {
    id: 'kyouko-beach',
    name: 'Kyouko Beach',
    source: 'official' as const,
    palette: paletteForWallpaper('kyouko-beach'),
    creator: 'hitcat',
    creatorLink: 'https://ko-fi.com/lu15ange7',
    creatorLinkName: 'Ko-fi de hitcat',
    src: kyoukoBeachWallpaper,
    thumbnail: kyoukoBeachThumbnail,
  },
  ...officialWallpapers,
].sort((first, second) => {
  if (first.id === 'original') return -1
  if (second.id === 'original') return 1
  return first.name.localeCompare(second.name)
})

export type WallpaperId = string
export type Wallpaper = (typeof wallpapers)[number] & { palette: CommunityPalette }

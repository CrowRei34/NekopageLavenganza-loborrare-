/**
 * Dark-mode role values adapted from Noctalia community palettes.
 * Palette source: https://github.com/noctalia-dev/community-palettes
 */
export interface CommunityPalette {
  id: string
  name: string
  surface: string
  onSurface: string
  surfaceVariant: string
  onSurfaceVariant: string
  primary: string
  onPrimary: string
  secondary: string
  tertiary: string
  error: string
  outline: string
  hover: string
  terminalBackground: string
  terminalForeground: string
}

export const communityPalettes = {
  nekovoidOriginal: {
    id: 'nekovoid-original',
    name: 'Neko Void original',
    surface: '#0E1214',
    onSurface: '#D5E5E1',
    surfaceVariant: '#192024',
    onSurfaceVariant: '#B7C9CA',
    primary: '#9DD2C0',
    onPrimary: '#06130F',
    secondary: '#C1A873',
    tertiary: '#A7CCE1',
    error: '#EF9FAE',
    outline: '#ABBCC4',
    hover: '#C2EFDF',
    terminalBackground: '#171D20',
    terminalForeground: '#D5E5E1',
  },
  everforest: {
    id: 'everforest',
    name: 'Everforest',
    surface: '#232A2E',
    onSurface: '#D3C6AA',
    surfaceVariant: '#2D353B',
    onSurfaceVariant: '#A7C080',
    primary: '#A7C080',
    onPrimary: '#232A2E',
    secondary: '#D3C6AA',
    tertiary: '#7FBBB3',
    error: '#E67E80',
    outline: '#7A8478',
    hover: '#A7C080',
    terminalBackground: '#1E2326',
    terminalForeground: '#D3C6AA',
  },
  matecito: {
    id: 'matecito',
    name: 'Matecito',
    surface: '#1E2320',
    onSurface: '#D3CDC3',
    surfaceVariant: '#272E2A',
    onSurfaceVariant: '#9DA49A',
    primary: '#8DA383',
    onPrimary: '#1E2320',
    secondary: '#CB9B7C',
    tertiary: '#7F9193',
    error: '#C27979',
    outline: '#4A534D',
    hover: '#8DA383',
    terminalBackground: '#1E2320',
    terminalForeground: '#D3CDC3',
  },
  oxocarbon: {
    id: 'oxocarbon',
    name: 'Oxocarbon',
    surface: '#161616',
    onSurface: '#F2F4F8',
    surfaceVariant: '#262626',
    onSurfaceVariant: '#DDE1E6',
    primary: '#33B1FF',
    onPrimary: '#161616',
    secondary: '#42BE65',
    tertiary: '#BE95FF',
    error: '#EE5396',
    outline: '#525252',
    hover: '#78A9FF',
    terminalBackground: '#161616',
    terminalForeground: '#F2F4F8',
  },
  rosePineMoon: {
    id: 'rose-pine-moon',
    name: 'Rose Pine Moon',
    surface: '#232136',
    onSurface: '#E0DEF4',
    surfaceVariant: '#393552',
    onSurfaceVariant: '#908CAA',
    primary: '#EA9A97',
    onPrimary: '#232136',
    secondary: '#9CCFD8',
    tertiary: '#C4A7E7',
    error: '#EB6F92',
    outline: '#44415A',
    hover: '#56526E',
    terminalBackground: '#232136',
    terminalForeground: '#E0DEF4',
  },
  cherryBlossom: {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    surface: '#2A1922',
    onSurface: '#F3C7D7',
    surfaceVariant: '#4D3745',
    onSurfaceVariant: '#EFDCE8',
    primary: '#F2C1D4',
    onPrimary: '#2A1B21',
    secondary: '#FFD6E2',
    tertiary: '#D4A3BD',
    error: '#EC8A92',
    outline: '#7A5368',
    hover: '#F4D86A',
    terminalBackground: '#2A1922',
    terminalForeground: '#F3C7D7',
  },
  kyoukoSunset: {
    id: 'kyouko-sunset',
    name: 'Kyouko Sunset',
    surface: '#241511',
    onSurface: '#F7DFBC',
    surfaceVariant: '#352018',
    onSurfaceVariant: '#D9B98E',
    primary: '#FFB347',
    onPrimary: '#28160E',
    secondary: '#F06B4E',
    tertiary: '#E8C36A',
    error: '#E97A68',
    outline: '#89614A',
    hover: '#FFD08A',
    terminalBackground: '#1C110F',
    terminalForeground: '#F6D6AE',
  },
} satisfies Record<string, CommunityPalette>

export type CommunityPaletteId = keyof typeof communityPalettes

// Curated against each official wallpaper's dominant hue, not its filename family.
const wallpaperPaletteIds: Record<string, CommunityPaletteId> = {
  original: 'nekovoidOriginal',
  'kyouko-beach': 'kyoukoSunset',
  edernity: 'matecito',
  'kioto---kyoko-wallpaper': 'cherryBlossom',
  kyoko12426426: 'oxocarbon',
  kyoko241: 'oxocarbon',
  kyoko2411: 'oxocarbon',
  kyoko32586230: 'everforest',
  kyokojsfjsa: 'everforest',
  kyokosafsaf: 'everforest',
  'kyouko-in-kioto': 'cherryBlossom',
  'kyouko-in-kioto-2': 'rosePineMoon',
  'kyouko-in-kioto-3': 'everforest',
  'kyouko-in-kioto-4': 'everforest',
  'moony-art': 'everforest',
  'moony-art2': 'rosePineMoon',
  'moony-art3': 'everforest',
  moony: 'everforest',
  moony3: 'everforest',
  'neko-kyokowallpaper-blue-jp': 'oxocarbon',
  'neko-kyokowallpaper-dark-jp': 'oxocarbon',
  'neko-kyokowallpaper-green-jp': 'everforest',
  'neko-kyokowallpaper-prueba-no-text': 'everforest',
  'neko-kyokowallpaper-rose-jp': 'cherryBlossom',
  'neko-kyokowallpaper-rose-no-text': 'rosePineMoon',
  'neko-kyokowallpaper': 'oxocarbon',
  neko: 'everforest',
  neko17: 'oxocarbon',
  'wall-moony-kyouko': 'oxocarbon',
}

export const paletteForWallpaper = (wallpaperId: string): CommunityPalette => {
  const paletteId = wallpaperPaletteIds[wallpaperId] ?? 'everforest'
  return communityPalettes[paletteId]
}

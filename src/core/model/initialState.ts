import type { Column, InfoDocument, NekovoidState, WebWindow, Workspace } from './types'

const info = (id: string, title: string, document: InfoDocument): WebWindow => ({
  id,
  kind: 'info',
  title,
  info: document,
})

const terminal = (id: string): WebWindow => ({
  id,
  kind: 'terminal',
  title: 'Terminal',
})

const column = (id: string, windows: WebWindow[], width: Column['width'] = 'medium'): Column => ({
  id,
  width,
  windows,
})

const workspace = (id: string, number: number, name: string, columns: Column[]): Workspace => ({
  id,
  number,
  name,
  columns,
  activeColumnId: columns[0]?.id ?? null,
  isEmptyPlaceholder: columns.length === 0,
})

const articleWorkspace = (
  id: string,
  number: number,
  name: string,
  document: InfoDocument,
  includeTerminal: boolean,
): Workspace =>
  workspace(id, number, name, [
    column(`${id}-info`, [info(`${id}-article`, document.title, document)], 'wide'),
    ...(includeTerminal
      ? [column(`${id}-terminal`, [terminal(`${id}-terminal-app`)], 'narrow')]
      : []),
  ])

const articles: Array<{ name: string; document: InfoDocument }> = [
  {
    name: 'ayuda',
    document: {
      eyebrow: 'SESSION 01 / WELCOME',
      title: 'NEKO VOID',
      body: 'Void Linux listo para explorar.',
      showProjectResources: true,
      bullets: [],
      controls: [
        { keys: 'RUEDA ↑↓', action: 'WORKSPACE' },
        { keys: 'SHIFT + RUEDA', action: 'COLUMNAS' },
        { keys: 'RUEDA ↔', action: 'TERMINAL' },
      ],
    },
  },
  {
    name: 'NEKO VOID',
    document: {
      eyebrow: 'Into the void',
      title: 'NEKO VOID',
      body: 'Simplicity is prerequisite for reliability',
      bullets: ['Código abierto · Licencia documentada en los repositorios.'],
    },
  },
  {
    name: 'arquitectura',
    document: {
      eyebrow: 'Especificaciones',
      title: 'Arquitectura Base',
      body: 'Basado en Void Linux con runit para tiempos de arranque ultrarrápidos. Incluye el entorno de escritorio MATE con herramientas esenciales preinstaladas.',
      bullets: [
        'Vouru ayuda a buscar, instalar y actualizar programas en Void Linux. Puede usar repositorios oficiales y otros CNR; este contiene las plantillas mantenidas por el creador y el equipo de Neko Void',
        'Gestor de kernels para Void Linux',
        'Asistente para instalar aplicaciones y controladores desde el sistema.',
        'Gestor gráfico ligero para paquetes XBPS',
      ],
    },
  },
  {
    name: 'gaming',
    document: {
      eyebrow: 'Especificaciones',
      title: 'Listo para Gaming',
      body: 'Optimizado para máximo rendimiento con soporte completo Vulkan, drivers non-free de Intel/AMD preconfigurados y soporte en beta para tarjetas NVIDIA compatibles.',
      bullets: [
        'Soporte completo API Vulkan',
        'Drivers Intel/AMD + soporte NVIDIA beta',
        'Ajustes de rendimiento optimizados',
        'Listo para Steam y Lutris',
      ],
    },
  },
  {
    name: 'Kasha',
    document: {
      eyebrow: 'Especificaciones',
      title: 'Instalador Kasha',
      body: 'Instalador personalizado que simplifica la configuración de Void Linux. Incluye un potente asistente post-instalación para configuración con un clic de flujos especializados.',
      bullets: [
        'Configuración fácil de usuario y red',
        'Particionado automático',
        'Categorías de apps en un clic',
        'Video, Música, Diseño, Gaming y más',
      ],
    },
  },
  {
    name: 'filosofía',
    document: {
      eyebrow: 'Filosofía',
      title: 'Por qué se creó',
      body: 'El proyecto se originó inicialmente como un hobby personal. Con el tiempo, evolucionó hasta convertirse en un proyecto estructurado con el objetivo de ofrecer una versión de Void Linux fácil de instalar y utilizar para el usuario final.',
      bullets: [],
    },
  },
  {
    name: 'público',
    document: {
      eyebrow: 'Filosofía',
      title: 'Público dirigido',
      body: 'Esta distribución está dirigida a usuarios que desean un sistema operativo ligero y robusto, fácilmente adaptable a su flujo de trabajo específico sin las complicaciones habituales de una configuración manual desde cero.',
      bullets: [],
    },
  },
  {
    name: 'simplicidad',
    document: {
      eyebrow: 'Filosofía',
      title: 'Simplicidad sobre Complejidad',
      body: 'Centralizar demasiado poder en una sola suite como systemd choca con la idea UNIX de herramientas pequeñas y separadas. Creemos que hacer una sola cosa bien es la clave para un sistema estable.',
      bullets: [],
    },
  },
  {
    name: 'transparencia',
    document: {
      eyebrow: 'Filosofía',
      title: 'Transparencia y Control',
      body: 'Una suite monolítica aumenta la superficie de ataque y añade abstracción innecesaria. Preferimos registros (logs) de texto plano por simplicidad y portabilidad. Si algo falla, leer archivos de texto con herramientas estándar como cat, less o grep resulta mucho más directo que depender de logs binarios.',
      bullets: [],
    },
  },
  {
    name: 'runit',
    document: {
      eyebrow: 'Filosofía',
      title: '100% Libre de Systemd',
      body: 'Somos orgullosamente compatibles con la iniciativa systemdfree.com. Al usar runit, aseguramos que tu sistema se mantenga modular, transparente y libre de dependencias monolíticas.',
      bullets: [],
    },
  },
  {
    name: 'escritorios',
    document: {
      eyebrow: 'Capturas',
      title: 'Capturas',
      body: 'Siete escritorios, una sola identidad Neko Void. Explora cada sesión al detalle.',
      bullets: [
        'Labwc — Compositor Wayland minimalista',
        'Niri — Mosaico desplazable en Wayland',
        'MATE — Escritorio clásico y familiar',
        'KDE Plasma — Escritorio completo y pulido',
        'LXQt — Escritorio Qt ligero',
        'IceWM — Ultraligero y directo',
        'Xfce — Escritorio equilibrado y eficiente',
      ],
    },
  },
  {
    name: 'instalación',
    document: {
      eyebrow: 'Ediciones',
      title: 'De la ISO al primer arranque',
      body: 'Kasha se distribuye actualmente en modo online. Necesitas conexión a Internet durante la instalación.',
      bullets: [
        'Elige edición',
        'Verifica SHA256',
        'Crea un USB con Ventoy',
        'Instala con Kasha',
        'Ejecuta Neko Wizard',
      ],
    },
  },
  {
    name: 'MATE Xorg',
    document: {
      eyebrow: 'Edición principal',
      title: 'MATE - Xorg',
      body: 'Recomendada para una primera instalación.',
      bullets: [],
    },
  },
  {
    name: 'MATE XLibre',
    document: {
      eyebrow: 'Edición principal',
      title: 'MATE - XLibre',
      body: 'MATE con la alternativa de servidor gráfico XLibre.',
      bullets: [],
    },
  },
  {
    name: 'NVIDIA',
    document: {
      eyebrow: 'Beta',
      title: 'NVIDIA',
      body: 'Edición con soporte beta para controladores propietarios NVIDIA.',
      bullets: ['Soporte en beta'],
    },
  },
  {
    name: 'ediciones',
    document: {
      eyebrow: 'Ediciones',
      title: 'Ediciones',
      body: 'Elige tu edición. Las opciones en gris siguen en desarrollo.',
      bullets: [
        'XFCE — Ligera y familiar.',
        'KDE — Un escritorio completo y personalizable.',
        'i3 — Una edición orientada a flujos de trabajo con tiling.',
        'OPENBOX — En desarrollo',
        'LXQT',
        'LABWC',
        'NIRI',
        'ICEWM & JWM',
      ],
    },
  },
  {
    name: 'equipo 1',
    document: {
      eyebrow: 'Equipo y Colaboradores',
      title: 'Equipo y Colaboradores',
      body: '',
      bullets: [
        'javiercplus — Creador y Desarrollador Core. Creador y desarrollador principal de la distribución Neko Void y del instalador Kasha.',
        'Crow — Tester y Diseñador Web. Encargado del diseño de la página web y de realizar pruebas (testing) de la distribución.',
        'Ezequiel — Kore Package Manager. Desarrollador de Kore Package Manager (Kepo), una GUI para instalar tarballs y AppImages en Neko Void.',
        'Becker — Diseñador de I3dots. Diseñador y responsable de la personalización de las dotfiles de i3 (I3dots) para Neko Void.',
      ],
    },
  },
  {
    name: 'equipo 2',
    document: {
      eyebrow: 'Equipo y Colaboradores',
      title: 'Equipo y Colaboradores',
      body: '',
      bullets: [
        'ANOMALI.0x00 — Desarrollador de Kernel Manager. Desarrollador responsable de la creación y mantenimiento del Neko Kernel Manager.',
        'KevinRunforrestt — Documentación y Tester. Encargado de la redacción de la documentación oficial y de realizar pruebas (testing).',
        'SrAltamar — Beta Tester. Encargado de realizar pruebas (testing).',
        'Mashalack — Mantenedor y Supervisor de la versión Musl. Mantenedor y supervisor de la versión musl de Neko Void.',
      ],
    },
  },
  {
    name: 'equipo 3',
    document: {
      eyebrow: 'Equipo y Colaboradores',
      title: 'Equipo y Colaboradores',
      body: '',
      bullets: [
        'rockman6554 — Creador de Vouru. Creador y desarrollador de Vouru.',
        'JMX369 — Beta Tester. Encargado de realizar pruebas (testing).',
        'Nubyunix — Tester de la edición NVIDIA. Pruebas de soporte NVIDIA e instalación de controladores con Neko Wizard.',
      ],
    },
  },
  {
    name: 'apoyo',
    document: {
      eyebrow: 'Apoyo opcional',
      title: 'Apoya el Proyecto',
      body: 'Si disfrutas de Neko Void y quieres apoyar su desarrollo, considera hacer una donación.',
      bullets: ['El apoyo es completamente opcional.'],
    },
  },
]

const initialWorkspaces: Workspace[] = [
  ...articles.map((article, index) =>
    articleWorkspace(
      `workspace-${index + 1}`,
      index + 1,
      article.name,
      article.document,
      index === 0,
    ),
  ),
  workspace('workspace-empty', articles.length + 1, 'empty', []),
]

export const initialState: NekovoidState = {
  workspaces: initialWorkspaces,
  activeWorkspaceId: 'workspace-1',
  terminalSessions: {},
  settings: {
    accent: 'mint',
    reducedMotion: false,
  },
}

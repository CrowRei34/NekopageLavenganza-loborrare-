# Nekovoid

Nekovoid es una experiencia web de escritorio inspirada en el modelo de navegación de Niri.

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Validación

```bash
pnpm typecheck
pnpm lint
pnpm test -- --run
pnpm build
```

O todo junto:

```bash
pnpm check
```

Si `pnpm` todavía no está instalado globalmente, puedes habilitarlo con
`corepack enable` o instalarlo con `npm install --global pnpm`.

## Controles

- Rueda vertical: cambiar de workspace.
- Rueda horizontal o `Shift` + rueda: cambiar de columna.
- `Ctrl/Meta + ↑/↓`: cambiar de workspace.
- `Ctrl/Meta + ←/→`: cambiar de columna.
- Botón `+`: abrir una terminal simulada.

La terminal nunca ejecuta comandos del sistema. Todas sus respuestas son locales y deterministas.

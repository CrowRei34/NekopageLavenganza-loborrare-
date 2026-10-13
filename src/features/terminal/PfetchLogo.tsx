import { Fragment } from 'react'

const encodedLogo =
  'ICAgIBtbMzg7MjsxNjY7MTM2OzEwMjs0OW3iloQbWzM4OzI7MjA0OzE4NjsxNjY7NDlt4paEICAbWzM4OzI7MTY2OzEzNjsxMDI7NDlt4paEG1szODsyOzE2NjsxMzY7MTAyOzQ5beKWhBtbbQogICAbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0OW3ilogbWzM4OzI7MjA0OzE4NjsxNjY7NDg7MjsxNjY7MTM2OzEwMm3iloAbWzM4OzI7MTY2OzEzNjsxMDI7NDg7MjsxMjE7OTc7NzBt4paAG1szODsyOzEyMTs5Nzs3MDs0OW3ilogbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsyMDQ7MTg2OzE2Njs0ODsyOzE2NjsxMzY7MTAybeKWgBtbbQogIBtbMzg7MjsxMjE7OTc7NzA7NDlt4paEG1szODsyOzEyMTs5Nzs3MDs0OW3ilogbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsxMjE7OTc7NzA7NDlt4paIG1szODsyOzEyMTs5Nzs3MDs0OW3ilogbWzM4OzI7MTY2OzEzNjsxMDI7NDg7MjsyMDQ7MTg2OzE2Nm3iloAbWzM4OzI7MTY2OzEzNjsxMDI7NDg7MjsxMjE7OTc7NzBt4paAG1szODsyOzE2NjsxMzY7MTAyOzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0ODsyOzEyMTs5Nzs3MG3iloAbW20KICAbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsxMjE7OTc7NzA7NDlt4paIG1szODsyOzEyMTs5Nzs3MDs0ODsyOzE2NjsxMzY7MTAybeKWgBtbMzg7MjsxNjY7MTM2OzEwMjs0OW3ilogbWzM4OzI7MTY2OzEzNjsxMDI7NDlt4paIG1szODsyOzIwNDsxODY7MTY2OzQ4OzI7MTY2OzEzNjsxMDJt4paAG1szODsyOzE2NjsxMzY7MTAyOzQ4OzI7MjA0OzE4NjsxNjZt4paAG1szODsyOzIwNDsxODY7MTY2OzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0ODsyOzIwNDsxODY7MTY2beKWgBtbMzg7MjsxNjY7MTM2OzEwMjs0OW3ilogbW20KIBtbMzg7MjsxMjE7OTc7NzA7NDlt4paIG1szODsyOzEyMTs5Nzs3MDs0OW3ilogbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0ODsyOzEyMTs5Nzs3MG3iloAbWzM4OzI7MTY2OzEzNjsxMDI7NDlt4paIG1szODsyOzE2NjsxMzY7MTAyOzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0ODsyOzIwNDsxODY7MTY2beKWgBtbMzg7MjsxNjY7MTM2OzEwMjs0ODsyOzIwNDsxODY7MTY2beKWgBtbMzg7MjsyMDQ7MTg2OzE2Njs0OW3ilogbWzM4OzI7MjA0OzE4NjsxNjY7NDlt4paIG1szODsyOzE2NjsxMzY7MTAyOzQ5beKWgBtbbQobWzM4OzI7MTIxOzk3OzcwOzQ5beKWhBtbMzg7MjsxMjE7OTc7NzA7NDlt4paIG1szODsyOzEyMTs5Nzs3MDs0OW3ilogbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsxMjE7OTc7NzA7NDg7MjsxNjY7MTM2OzEwMm3iloAbWzM4OzI7MTY2OzEzNjsxMDI7NDlt4paIG1szODsyOzIwNDsxODY7MTY2OzQ5beKWiBtbMzg7MjsyMDQ7MTg2OzE2Njs0OW3ilogbWzM4OzI7MjA0OzE4NjsxNjY7NDlt4paIG1ttChtbMzg7MjsxMjE7OTc7NzA7NDlt4paIG1szODsyOzEyMTs5Nzs3MDs0OW3ilogbWzM4OzI7MTIxOzk3OzcwOzQ5beKWiBtbMzg7MjsxMjE7OTc7NzA7NDlt4paIG1szODsyOzE2NjsxMzY7MTAyOzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0OW3ilogbWzM4OzI7MjA0OzE4NjsxNjY7NDlt4paIG1szODsyOzIwNDsxODY7MTY2OzQ5beKWiBtbMzg7MjsyMDQ7MTg2OzE2Njs0OW3ilogbWzM4OzI7MjA0OzE4NjsxNjY7NDlt4paEG1ttCiAgG1szODsyOzEyMTs5Nzs3MDs0OW3iloAbWzM4OzI7MTY2OzEzNjsxMDI7NDlt4paIG1szODsyOzE2NjsxMzY7MTAyOzQ5beKWiBtbMzg7MjsxNjY7MTM2OzEwMjs0OW3ilogbWzM4OzI7MjA0OzE4NjsxNjY7NDg7MjsxNjY7MTM2OzEwMm3iloAbWzM4OzI7MjA0OzE4NjsxNjY7NDlt4paIG1szODsyOzIwNDsxODY7MTY2OzQ5beKWiBtbMzg7MjsyMDQ7MTg2OzE2Njs0OW3iloAbW20KG1ttCg=='

const logo = new globalThis.TextDecoder().decode(
  Uint8Array.from(globalThis.atob(encodedLogo), (character) => character.charCodeAt(0)),
)

interface AnsiStyle {
  color?: string
  backgroundColor?: string
}

const colorFrom = (red: number, green: number, blue: number) => {
  const sourceColor = `${red} ${green} ${blue}`
  if (sourceColor === '121 97 70') {
    return 'color-mix(in srgb, var(--tui-accent-primary) 45%, var(--tui-bg))'
  }
  if (sourceColor === '166 136 102') return 'var(--tui-accent-primary)'
  if (sourceColor === '204 186 166') {
    return 'color-mix(in srgb, var(--tui-accent-primary) 45%, var(--tui-fg))'
  }
  return `rgb(${red} ${green} ${blue})`
}

const parseLogo = () => {
  const lines: Array<Array<{ character: string; style: AnsiStyle }>> = [[]]
  let style: AnsiStyle = {}
  let cursor = 0

  while (cursor < logo.length) {
    if (logo.startsWith('\u001b[', cursor)) {
      const end = logo.indexOf('m', cursor)
      const values = logo
        .slice(cursor + 2, end)
        .split(';')
        .map(Number)

      for (let index = 0; index < values.length; index += 1) {
        const value = values[index]
        if (value === 0) style = {}
        if (value === 39) style = { ...style, color: undefined }
        if (value === 49) style = { ...style, backgroundColor: undefined }
        if ((value === 38 || value === 48) && values[index + 1] === 2) {
          const color = colorFrom(values[index + 2], values[index + 3], values[index + 4])
          style = value === 38 ? { ...style, color } : { ...style, backgroundColor: color }
          index += 4
        }
      }
      cursor = end + 1
      continue
    }

    const nextEscape = logo.indexOf('\u001b[', cursor)
    const end = nextEscape === -1 ? logo.length : nextEscape
    const text = logo.slice(cursor, end)
    for (const character of text) {
      if (character === '\n') lines.push([])
      else lines[lines.length - 1].push({ character, style })
    }
    cursor = end
  }

  if (lines.at(-1)?.length === 0) lines.pop()
  return lines
}

const logoLines = parseLogo()

export const PfetchLogo = () => (
  <span className="terminal-pfetch__logo" role="img" aria-label="Logo de Neko Void">
    {logoLines.map((line, lineIndex) => (
      <Fragment key={lineIndex}>
        {line.map(({ character, style }, characterIndex) => (
          <span key={characterIndex} style={style}>
            {character}
          </span>
        ))}
        {lineIndex < logoLines.length - 1 && '\n'}
      </Fragment>
    ))}
  </span>
)

// Launcher glyphs retain their Tabler paths; the link marks are compact custom SVGs.
// See Tabler.LICENSE.txt for the upstream license.
const paths = {
  grid: (
    <>
      <path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
      <path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
      <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
      <path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
    </>
  ),
  window: (
    <>
      <path d="M7 5.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
      <path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1" />
      <path d="M17 7h.01" />
      <path d="M7 13l3.644 -3.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644" />
      <path d="M15 12l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l2.644 2.644" />
    </>
  ),
  terminal: (
    <>
      <path d="m5 7 5 5-5 5" />
      <path d="M13 17h6" />
    </>
  ),
  waves: (
    <>
      <path d="M4 9.25c1.9-1.8 3.8-1.8 5.7 0s3.8 1.8 5.7 0 3.8-1.8 5.7 0" />
      <path d="M4 14.75c1.9-1.8 3.8-1.8 5.7 0s3.8 1.8 5.7 0 3.8-1.8 5.7 0" />
    </>
  ),
  discord: (
    <>
      <path d="M8 6.5c2.5-.8 5.5-.8 8 0l2.2 1.2c1.1 2.1 1.7 4.5 1.8 7.2-1.4 1.4-2.8 2.2-4.2 2.6l-1.1-1.5" />
      <path d="M8 6.5 5.8 7.7C4.7 9.8 4.1 12.2 4 14.9c1.4 1.4 2.8 2.2 4.2 2.6l1.1-1.5" />
      <path d="M9 13h.01M15 13h.01" />
      <path d="M9.5 15.2c1.6.8 3.4.8 5 0" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
} as const

interface BarIconProps {
  name: keyof typeof paths
}

export const BarIcon = ({ name }: BarIconProps) => (
  <svg
    className="bar-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {paths[name]}
  </svg>
)

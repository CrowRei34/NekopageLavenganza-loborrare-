const editions = [
  {
    label: 'Descargar edición recomendada',
    href: 'https://huggingface.co/buckets/arepaconcafe/neko-base-bucket/resolve/nekovoid-mate-20260921.iso',
    primary: true,
  },
  {
    label: 'Elegir otra edición',
    href: 'https://www.neko-void-linux.online/#downloads',
    primary: false,
  },
]

const projectLinks = [
  { label: 'SourceForge', href: 'https://sourceforge.net/projects/neko-void/' },
  { label: 'Codeberg', href: 'https://codeberg.org/Neko-Void' },
  {
    label: 'DistroWatch',
    href: 'https://distrowatch.com/table.php?distribution=nekovoid',
  },
  { label: 'Kasha Installer', href: 'https://gitlab.com/javiercplus/kasha-installer' },
  { label: 'GitHub', href: 'https://github.com/Neko-Void-Linux' },
  { label: 'Wiki', href: 'https://wiki.neko-void-linux.online/' },
]

export const WelcomeResources = () => (
  <section className="welcome-resources" aria-label="Descargas y recursos de Neko Void">
    <div className="welcome-resources__heading">
      <span>DOWNLOAD / RESOURCES</span>
      <span>06 LINKS</span>
    </div>
    <div className="welcome-resources__editions">
      {editions.map(({ label, href, primary }) => (
        <a
          className={`welcome-resource-button ${primary ? 'welcome-resource-button--primary' : ''}`}
          href={href}
          key={label}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ))}
    </div>
    <nav className="welcome-resources__links" aria-label="Enlaces oficiales de Neko Void">
      {projectLinks.map(({ label, href }) => (
        <a href={href} key={label} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ))}
    </nav>
  </section>
)

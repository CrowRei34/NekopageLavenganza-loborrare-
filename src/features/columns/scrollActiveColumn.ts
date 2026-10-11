export const scrollActiveColumnIntoView = (strip: HTMLElement, active: HTMLElement): void => {
  const stripLeft = strip.getBoundingClientRect().left
  const activeBounds = active.getBoundingClientRect()
  const activeLeft = strip.scrollLeft + activeBounds.left - stripLeft
  const activeRight = activeLeft + activeBounds.width
  const visibleLeft = strip.scrollLeft
  const visibleRight = visibleLeft + strip.clientWidth

  const nextLeft =
    activeLeft < visibleLeft
      ? activeLeft
      : activeRight > visibleRight
        ? activeRight - strip.clientWidth
        : null

  if (nextLeft !== null && typeof strip.scrollTo === 'function') {
    strip.scrollTo({ left: Math.max(0, nextLeft), behavior: 'smooth' })
  }
}

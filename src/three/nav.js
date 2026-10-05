// Scroll story length (timeline units) and the nav helper that jumps along it
export const TOTAL = 140

export function goTo(unit) {
  const max = document.documentElement.scrollHeight - innerHeight
  scrollTo({ top: (unit / TOTAL) * max, behavior: 'smooth' })
}

// Decorative background: coffee cups and sandwiches scattered around the screen.
// A takeaway coffee cup: lid, tapered body and a sleeve.
export const Cup = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M26 34 32 88h36l6-54" fill="currentColor" fillOpacity="0.25" />
    <path d="M28 52h44l-1.6 20H29.6z" fill="currentColor" fillOpacity="0.25" />
    <path d="M20 34v-5a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v5z" fill="currentColor" fillOpacity="0.25" />
    <path d="M38 23v-5a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v5" />
  </svg>
)

// A triangle sandwich: pointed top slice, wavy filling, flat bottom slice.
const Sandwich = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <g transform="translate(50 50) scale(1.2) translate(-50 -50)">
    <path d="M17.5 51 33 34Q38 29.5 45 32L84 47.5 81.5 53 16.5 56.5Z" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <path d="M16 65 13.7 69.8 82 66.9 84 60.5Z" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <path d="M17.5 51 33 34Q38 29.5 45 32L84 47.5 81.5 53 16.5 56.5Z" />
    <path d="M17.5 51 84 47.5" />
    <path d="M16.5 57C11 57.5 11 63.5 15 64.5" />
    <path d="M82.5 53.5C88 55 89 60 84.5 60.5" />
    <path d="M15.5 61.7C20 61.5 22 61 25 61.8S33 66 36 64 45 58 52 60 58 63 62 59 67 60 70 58 76 57 80 59 83 59.5 84.6 60.5" />
    <path d="M16 65 13.7 69.8 82 66.9 84 60.5" />
    </g>
  </svg>
)

type Item = { kind: 'cup' | 'sandwich'; top: number; left: number; size: number; rotate: number }

// A staggered grid covering the whole screen, every item the same size and
// the same distance from its neighbours. Only the tilt varies, and it comes
// from the cell index so the pattern never changes between renders.
const COLS = 9
const ROWS = 5
const SIZE = 7

const items: Item[] = Array.from({ length: COLS * ROWS }, (_, i) => {
  const row = Math.floor(i / COLS)
  const col = i % COLS
  return {
    kind: (row + col) % 2 === 0 ? 'cup' : 'sandwich',
    top: ((row + 0.5) / ROWS) * 100,
    left: ((col + 0.5 + (row % 2) * 0.5) / (COLS + 0.5)) * 100,
    size: SIZE,
    rotate: (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 5),
  }
})

export default function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-slate-400 opacity-40">
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${it.top}%`,
            left: `${it.left}%`,
            width: `${it.size}vw`,
            height: `${it.size}vw`,
            marginTop: `-${it.size / 2}vw`,
            marginLeft: `-${it.size / 2}vw`,
            transform: `rotate(${it.rotate}deg)`,
          }}
        >
          {it.kind === 'cup' ? <Cup /> : <Sandwich />}
        </div>
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { config } from './config'
import Decor, { Cup } from './Decor'

const { stageMs, colors } = config

type Order = { number: string; stageSince?: number }

// Stamp the order that is now first in line with the moment it reached the stage.
const promote = (list: Order[], now: number): Order[] =>
  list.length > 0 && list[0].stageSince === undefined
    ? [{ ...list[0], stageSince: now }, ...list.slice(1)]
    : list

const formatMs = (ms: number) => {
  const secs = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [now, setNow] = useState(Date.now())

  // Orders wait in line with no timer. Only the one on the big stage counts
  // down. When it runs out it leaves the screen and the next one moves up.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setNow(now)
      setOrders((prev) => {
        const [hero, ...rest] = prev
        if (!hero || now < hero.stageSince! + stageMs) return prev
        return promote(rest, now)
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // New orders join the back of the line. Typing the number on the big stage
  // restarts its countdown. Typing a number that is already waiting does nothing.
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const number = value.trim()
    if (!number) return
    const now = Date.now()
    setNow(now)
    setOrders((prev) => {
      if (prev[0]?.number === number) {
        return [{ ...prev[0], stageSince: now }, ...prev.slice(1)]
      }
      if (prev.some((o) => o.number === number)) return prev
      return promote([...prev, { number }], now)
    })
    setValue('')
  }

  const [hero, ...rest] = orders

  return (
    <div
      className="relative flex h-screen cursor-none overflow-hidden p-12"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <Decor />
      <section className="relative flex-1">
        <div className="mb-8 flex justify-center">
          <h1
            className="font-display flex items-center gap-4 rounded-full border-2 px-8 py-3 text-4xl font-bold"
            style={{ backgroundColor: colors.background, borderColor: colors.border }}
          >
            <span className="h-12 w-12" style={{ color: colors.accent }}>
              <Cup />
            </span>
            {config.servingLabel}
          </h1>
        </div>
        {hero && (
          <div
            className="relative mb-4 rounded-lg px-6 py-12 text-center text-9xl font-extrabold"
            style={{ backgroundColor: colors.accent, color: colors.accentText }}
          >
            {hero.number}
            {config.showTimer && (
              <span className="absolute right-4 bottom-3 text-4xl font-bold tabular-nums">
                {formatMs(hero.stageSince! + stageMs - now)}
              </span>
            )}
          </div>
        )}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${config.servingColumns}, minmax(0, 1fr))`,
          }}
        >
          {rest.map((o) => (
            <div
              key={o.number}
              className="relative rounded-lg px-2 py-4 text-center text-6xl font-extrabold"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}
            >
              {o.number}
            </div>
          ))}
        </div>
        <form
          onSubmit={submit}
          className={config.showInput ? 'absolute right-0 bottom-0 w-1/5' : 'sr-only'}
        >
          <input
            ref={inputRef}
            className="w-full rounded-lg border-2 px-3 py-1 text-right text-3xl font-bold tabular-nums outline-none"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }}
            autoFocus
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
            onBlur={() => inputRef.current?.focus()}
          />
        </form>
      </section>
    </div>
  )
}

export default App

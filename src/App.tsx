import { useEffect, useRef, useState } from 'react'
import { config } from './config'

const { stageMs, maxPastOrders, colors } = config

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
  const [pastOrders, setPastOrders] = useState<Order[]>([])
  const [now, setNow] = useState(Date.now())

  // Orders wait in line with no timer. Only the one on the big stage counts down.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setNow(now)
      const [hero, ...rest] = orders
      if (!hero || now < hero.stageSince! + stageMs) return
      setOrders(promote(rest, now))
      setPastOrders((prev) => [...prev, hero].slice(-maxPastOrders))
    }, 1000)
    return () => clearInterval(id)
  }, [orders])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const number = value.trim()
    if (!number) return
    const now = Date.now()
    setNow(now)
    const exists = [...orders, ...pastOrders].some((o) => o.number === number)
    if (exists) {
      setOrders((prev) => promote(prev.filter((o) => o.number !== number), now))
      setPastOrders((prev) => prev.filter((o) => o.number !== number))
    } else {
      setOrders((prev) => promote([...prev, { number }], now))
    }
    setValue('')
  }

  const [hero, ...rest] = orders

  return (
    <div
      className="flex h-screen cursor-none overflow-hidden p-12"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <section
        className="flex-1 border-r-2 pr-12"
        style={{ borderColor: colors.border }}
      >
        <h1 className="mb-8 text-5xl font-bold">{config.servingLabel}</h1>
        {hero && (
          <div
            className="relative mb-4 rounded-lg px-6 py-12 text-center text-9xl font-bold"
            style={{ backgroundColor: colors.accent, color: colors.accentText }}
          >
            {hero.number}
            {config.showTimer && (
              <span className="absolute right-4 bottom-3 text-2xl font-semibold tabular-nums">
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
              className="relative rounded-lg px-2 py-4 text-center text-6xl font-bold"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}
            >
              {o.number}
            </div>
          ))}
        </div>
      </section>

      <section className="relative w-1/5 pl-12">
        <h1 className="mb-8 text-5xl font-bold">{config.pastLabel}</h1>
        <ul className="flex flex-col gap-3">
          {pastOrders.map((o) => (
            <li
              key={o.number}
              className="rounded-lg border-2 px-6 py-3 text-4xl font-bold"
              style={{ borderColor: colors.border }}
            >
              {o.number}
            </li>
          ))}
        </ul>
        <form
          onSubmit={submit}
          className={config.showInput ? 'absolute right-0 bottom-0 left-12' : 'sr-only'}
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

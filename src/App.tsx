import { useEffect, useReducer, useRef, useState } from 'react'
import { clearSettings, defaultSettings, loadSettings, saveSettings, type Settings, type TicketSize } from './config'
import Decor from './Decor'
import { emptyOrders, kinds, ordersReducer, type Kind } from './orders'
import SettingsDialog, { GearIcon } from './SettingsDialog'

// Full class names so Tailwind can find them at build time.
const ticketClasses: Record<TicketSize, { box: string; timer: string }> = {
  small: { box: 'h-24 text-5xl', timer: 'text-xl' },
  medium: { box: 'h-32 text-7xl', timer: 'text-2xl' },
  large: { box: 'h-56 text-9xl', timer: 'text-4xl' },
}

const formatMs = (ms: number) => {
  const secs = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [orders, dispatch] = useReducer(ordersReducer, emptyOrders)
  const [now, setNow] = useState(Date.now())
  const [config, setConfig] = useState<Settings>(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { colors } = config
  const stageMs = config.stageSeconds * 1000
  const prefixes: Record<Kind, string> = {
    coffee: config.coffeePrefix,
    broodjies: config.broodjiesPrefix,
  }

  const closeSettings = () => {
    setSettingsOpen(false)
    inputRef.current?.focus()
  }

  const saveConfig = (next: Settings) => {
    saveSettings(next)
    setConfig(next)
    closeSettings()
  }

  const resetConfig = () => {
    clearSettings()
    setConfig(defaultSettings)
    closeSettings()
  }

  // Each column is its own line. Orders wait with no timer. Only the one on
  // top counts down. When it runs out it leaves the screen and the next one
  // moves up.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setNow(now)
      dispatch({ type: 'tick', now, stageMs })
    }, 1000)
    return () => clearInterval(id)
  }, [stageMs])

  // The prefix picks the column and the rest is the order number, so with the
  // default prefixes 01234 is coffee 1234 and 11234 is broodjies 1234. New orders join the back
  // of that column's line. Typing the number on top restarts its countdown.
  // Typing a number that is already waiting in that column does nothing.
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const kind = kinds.find((k) => value.startsWith(prefixes[k]))
    const number = kind ? value.slice(prefixes[kind].length) : ''
    if (!kind || !number) {
      setValue('')
      return
    }
    const now = Date.now()
    setNow(now)
    dispatch({ type: 'submit', kind, number, now })
    setValue('')
  }

  return (
    <div
      className="relative flex h-screen overflow-hidden p-12"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <Decor />
      <button
        type="button"
        aria-label="Settings"
        className="absolute right-1 bottom-13 z-10 h-10 w-10 cursor-pointer opacity-60 hover:opacity-100"
        style={{ color: colors.text }}
        onClick={() => setSettingsOpen(true)}
      >
        <GearIcon />
      </button>
      <section className="relative flex-1">
        <div className="grid grid-cols-2 gap-8">
          {kinds.map((kind) => (
            <div key={kind} className="flex flex-col gap-4 px-8">
              <h1
                className="font-display self-center rounded-full border-2 px-8 py-3 text-4xl font-bold"
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
              >
                {kind === 'coffee' ? config.coffeeLabel : config.broodjiesLabel}
              </h1>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${config.ticketColumns}, minmax(0, 1fr))` }}
              >
                {orders[kind].map((o, i) => (
                  <div
                    key={o.number}
                    className={`relative flex items-center justify-center rounded-lg px-2 text-center font-extrabold ${ticketClasses[config.ticketSize].box}`}
                    style={{ backgroundColor: colors.accent, color: colors.accentText }}
                  >
                    {o.number}
                    {i === 0 && o.stageSince !== null && config.showTimer && (
                      <span
                        className={`absolute right-3 bottom-2 font-bold tabular-nums ${ticketClasses[config.ticketSize].timer}`}
                      >
                        {formatMs(o.stageSince + stageMs - now)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
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
            onBlur={() => !settingsOpen && inputRef.current?.focus()}
          />
        </form>
      </section>
      {settingsOpen && (
        <SettingsDialog
          settings={config}
          onSave={saveConfig}
          onReset={resetConfig}
          onClose={closeSettings}
        />
      )}
    </div>
  )
}

export default App

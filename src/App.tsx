import { useEffect, useReducer, useRef, useState } from 'react'
import { clearSettings, defaultSettings, loadSettings, saveSettings, type Settings, type TicketSize } from './config'
import Countdown from './Countdown'
import Decor from './Decor'
import { emptyOrders, kinds, ordersReducer, parseEntry, type Kind } from './orders'
import SettingsDialog, { GearIcon } from './SettingsDialog'

// Full class names so Tailwind can find them at build time.
const ticketClasses: Record<TicketSize, { box: string; timer: string }> = {
  small: { box: 'h-24 text-5xl', timer: 'text-xl' },
  medium: { box: 'h-32 text-7xl', timer: 'text-2xl' },
  large: { box: 'h-56 text-9xl', timer: 'text-4xl' },
}

// Rows of tickets that fit on screen for each ticket size.
const visibleRows: Record<TicketSize, number> = { small: 6, medium: 5, large: 3 }

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [orders, dispatch] = useReducer(ordersReducer, emptyOrders)
  const [config, setConfig] = useState<Settings>(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { colors } = config
  const stageMs = config.stageSeconds * 1000
  const maxVisible = visibleRows[config.ticketSize] * config.ticketColumns
  const prefixes: Record<Kind, string> = {
    left: config.leftPrefix,
    right: config.rightPrefix,
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
      dispatch({ type: 'tick', now: Date.now(), stageMs })
    }, 1000)
    return () => clearInterval(id)
  }, [stageMs])

  // The prefix picks the column and the rest is the order number, so with the
  // default prefixes 01234 is left column 1234 and 11234 is right column 1234. New orders join the back
  // of that column's line. Typing the number on top restarts its countdown.
  // Typing a number that is already waiting in that column does nothing.
  // Starting with the remove prefix (default 3) takes that order number off
  // both columns instead, whether it is on top or still waiting, so 31234
  // removes 1234 from both columns.
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const entry = parseEntry(value, prefixes, config.removePrefix)
    if (entry) dispatch({ ...entry, now: Date.now() })
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
                {kind === 'left' ? config.leftLabel : config.rightLabel}
              </h1>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${config.ticketColumns}, minmax(0, 1fr))` }}
              >
                {orders[kind].slice(0, maxVisible).map((o, i) => (
                  <div
                    key={o.number}
                    className={`relative flex items-center justify-center rounded-lg px-2 text-center font-extrabold ${ticketClasses[config.ticketSize].box}`}
                    style={{ backgroundColor: colors.accent, color: colors.accentText }}
                  >
                    {o.number}
                    {i === 0 && o.stageSince !== null && config.showTimer && (
                      <Countdown
                        since={o.stageSince}
                        durationMs={stageMs}
                        className={`absolute right-3 bottom-2 font-bold tabular-nums ${ticketClasses[config.ticketSize].timer}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              {orders[kind].length > maxVisible && (
                <p className="font-display self-center text-3xl font-bold" aria-live="polite">
                  +{orders[kind].length - maxVisible} waiting
                </p>
              )}
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

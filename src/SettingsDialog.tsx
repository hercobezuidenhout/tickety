import { useEffect, useRef, useState } from 'react'
import { maxTicketColumns, parseSettings, prefixesClash, ticketSizes, type Settings } from './config'

export const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

type Props = {
  settings: Settings
  onSave: (settings: Settings) => void
  onReset: () => void
  onClose: () => void
}

const colorFields: { key: keyof Settings['colors']; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'accent', label: 'Ticket' },
  { key: 'accentText', label: 'Ticket text' },
  { key: 'border', label: 'Border' },
]

export default function SettingsDialog({ settings, onSave, onReset, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState({ ...settings, stageSeconds: String(settings.stageSeconds) })

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const stageSeconds = Number(draft.stageSeconds)
  const prefixesValid =
    draft.coffeePrefix !== '' &&
    draft.broodjiesPrefix !== '' &&
    !prefixesClash(draft.coffeePrefix, draft.broodjiesPrefix)
  const valid = Number.isFinite(stageSeconds) && stageSeconds > 0 && prefixesValid

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    onSave(parseSettings({ ...draft, stageSeconds }))
  }

  const field = 'w-full rounded-lg border-2 border-gray-400 bg-white px-3 py-2 text-lg text-slate-900'
  const label = 'flex flex-col gap-1 text-sm font-bold'

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-full max-w-xl rounded-lg bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/50"
    >
      <form onSubmit={save} className="flex flex-col gap-5">
        <h2 className="font-display text-3xl font-bold">Settings</h2>

        <label className={label}>
          Seconds each number stays on top
          <input
            className={field}
            type="number"
            min="1"
            value={draft.stageSeconds}
            onChange={(e) => setDraft({ ...draft, stageSeconds: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Ticket size
            <select
              className={field}
              value={draft.ticketSize}
              onChange={(e) =>
                setDraft({ ...draft, ticketSize: e.target.value as Settings['ticketSize'] })
              }
            >
              {ticketSizes.map((size) => (
                <option key={size} value={size}>
                  {size[0].toUpperCase() + size.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Ticket columns in each column
            <select
              className={field}
              value={draft.ticketColumns}
              onChange={(e) => setDraft({ ...draft, ticketColumns: Number(e.target.value) })}
            >
              {Array.from({ length: maxTicketColumns }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Left column prefix
            <input
              className={field}
              inputMode="numeric"
              value={draft.coffeePrefix}
              onChange={(e) => setDraft({ ...draft, coffeePrefix: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          <label className={label}>
            Right column prefix
            <input
              className={field}
              inputMode="numeric"
              value={draft.broodjiesPrefix}
              onChange={(e) => setDraft({ ...draft, broodjiesPrefix: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          {!prefixesValid && (
            <p className="col-span-2 text-sm font-bold text-red-700">
              Each prefix needs at least one digit, and neither can start with the other.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Left column title
            <input
              className={field}
              value={draft.coffeeLabel}
              onChange={(e) => setDraft({ ...draft, coffeeLabel: e.target.value })}
            />
          </label>
          <label className={label}>
            Right column title
            <input
              className={field}
              value={draft.broodjiesLabel}
              onChange={(e) => setDraft({ ...draft, broodjiesLabel: e.target.value })}
            />
          </label>
        </div>

        <div className="flex gap-6 text-lg font-bold">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={draft.showTimer}
              onChange={(e) => setDraft({ ...draft, showTimer: e.target.checked })}
            />
            Show timer
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={draft.showInput}
              onChange={(e) => setDraft({ ...draft, showInput: e.target.checked })}
            />
            Show input box
          </label>
        </div>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="mb-2 text-sm font-bold">Colours (any CSS colour)</legend>
          {colorFields.map(({ key, label: name }) => (
            <label key={key} className={label}>
              {name}
              <span className="flex items-center gap-2">
                <span
                  className="h-10 w-10 shrink-0 rounded-lg border-2 border-gray-400"
                  style={{ backgroundColor: draft.colors[key] }}
                />
                <input
                  className={field}
                  value={draft.colors[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, colors: { ...draft.colors, [key]: e.target.value } })
                  }
                />
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-lg border-2 border-gray-400 px-4 py-2 font-bold"
            onClick={onReset}
          >
            Reset to defaults
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 px-4 py-2 font-bold"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!valid}
              className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}

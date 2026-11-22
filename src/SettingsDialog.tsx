import { useEffect, useRef, useState } from 'react'
import { contrastRatio, isHexColor, minContrast } from './colors'
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

// Colours that sit on top of each other on screen.
const colorPairs: { a: ColorKey; b: ColorKey; name: string }[] = [
  { a: 'text', b: 'background', name: 'Text on background' },
  { a: 'accentText', b: 'accent', name: 'Ticket text on ticket' },
]

const inElectron = navigator.userAgent.includes('Electron')

type ColorKey = keyof Settings['colors']

const colorFields: { key: ColorKey; label: string }[] = [
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
    draft.leftPrefix !== '' &&
    draft.rightPrefix !== '' &&
    draft.removePrefix !== '' &&
    !prefixesClash(draft.leftPrefix, draft.rightPrefix, draft.removePrefix)
  const colorsValid = colorFields.every(({ key }) => isHexColor(draft.colors[key]))
  const valid = Number.isFinite(stageSeconds) && stageSeconds > 0 && prefixesValid && colorsValid
  const lowContrast = colorPairs.filter(
    ({ a, b }) =>
      isHexColor(draft.colors[a]) &&
      isHexColor(draft.colors[b]) &&
      contrastRatio(draft.colors[a], draft.colors[b]) < minContrast,
  )

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

        <div className="grid grid-cols-3 gap-4">
          <label className={label}>
            Left column prefix
            <input
              className={field}
              inputMode="numeric"
              value={draft.leftPrefix}
              onChange={(e) => setDraft({ ...draft, leftPrefix: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          <label className={label}>
            Right column prefix
            <input
              className={field}
              inputMode="numeric"
              value={draft.rightPrefix}
              onChange={(e) => setDraft({ ...draft, rightPrefix: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          <label className={label}>
            Remove prefix
            <input
              className={field}
              inputMode="numeric"
              value={draft.removePrefix}
              onChange={(e) => setDraft({ ...draft, removePrefix: e.target.value.replace(/\D/g, '') })}
            />
          </label>
          {!prefixesValid && (
            <p className="col-span-3 text-sm font-bold text-red-700">
              Each prefix needs at least one digit, and none can start with another.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Left column title
            <input
              className={field}
              value={draft.leftLabel}
              onChange={(e) => setDraft({ ...draft, leftLabel: e.target.value })}
            />
          </label>
          <label className={label}>
            Right column title
            <input
              className={field}
              value={draft.rightLabel}
              onChange={(e) => setDraft({ ...draft, rightLabel: e.target.value })}
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
          <legend className="mb-2 text-sm font-bold">Colours</legend>
          {colorFields.map(({ key, label: name }) => {
            const color = draft.colors[key]
            const setColor = (value: string) =>
              setDraft({ ...draft, colors: { ...draft.colors, [key]: value } })
            return (
              <label key={key} className={label}>
                {name}
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`${name} colour picker`}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-2 border-gray-400 bg-white p-0.5"
                    value={isHexColor(color) ? color.toLowerCase() : '#000000'}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <input
                    className={isHexColor(color) ? field : field.replace('border-gray-400', 'border-red-700')}
                    aria-invalid={!isHexColor(color)}
                    maxLength={7}
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </span>
              </label>
            )
          })}
          {!colorsValid && (
            <p className="col-span-2 text-sm font-bold text-red-700">
              Colours must be written as # followed by six digits or letters A to F, like #34d399.
            </p>
          )}
          {lowContrast.map(({ a, b, name }) => (
            <p key={a} className="col-span-2 text-sm font-bold text-amber-700">
              {name} may be hard to read: contrast is {contrastRatio(draft.colors[a], draft.colors[b]).toFixed(1)}:1
              and should be at least {minContrast}:1.
            </p>
          ))}
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 px-4 py-2 font-bold"
              onClick={onReset}
            >
              Reset to defaults
            </button>
            {inElectron && (
              <button
                type="button"
                className="rounded-lg border-2 border-red-700 px-4 py-2 font-bold text-red-700"
                onClick={() => window.close()}
              >
                Quit Tickety
              </button>
            )}
          </div>
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

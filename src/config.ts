import json from './config.json'

export const ticketSizes = ['small', 'medium', 'large'] as const
export type TicketSize = (typeof ticketSizes)[number]
export const maxTicketColumns = 4

export type Settings = {
  stageSeconds: number
  ticketSize: TicketSize
  ticketColumns: number
  coffeePrefix: string
  broodjiesPrefix: string
  coffeeLabel: string
  broodjiesLabel: string
  showTimer: boolean
  showInput: boolean
  colors: {
    background: string
    text: string
    accent: string
    accentText: string
    border: string
  }
}

const storageKey = 'tickety.settings'

// Values come from config.json at build time and can be overridden on the
// device through the settings dialog. Anything missing or invalid falls back
// to the defaults below.
type Raw = Record<string, unknown> & { colors?: Record<string, unknown> }

const text = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback

const positiveNumber = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback

const flag = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

// Prefixes are digits. Two prefixes clash when one starts with the other,
// because a typed number could then belong to either column.
export const prefixesClash = (a: string, b: string) =>
  a.startsWith(b) || b.startsWith(a)

const prefix = (value: unknown, fallback: string) =>
  typeof value === 'string' && /^\d+$/.test(value) ? value : fallback

const ticketSize = (value: unknown, fallback: TicketSize) =>
  ticketSizes.find((size) => size === value) ?? fallback

const ticketColumns = (value: unknown, fallback: number) =>
  Math.min(maxTicketColumns, Math.max(1, Math.floor(positiveNumber(value, fallback))))

export const parseSettings = (raw: Raw): Settings => {
  const coffeePrefix = prefix(raw.coffeePrefix, '0')
  const broodjiesPrefix = prefix(raw.broodjiesPrefix, '1')
  const clash = prefixesClash(coffeePrefix, broodjiesPrefix)
  return {
    stageSeconds: positiveNumber(raw.stageSeconds, 60),
    ticketSize: ticketSize(raw.ticketSize, 'medium'),
    ticketColumns: ticketColumns(raw.ticketColumns, 1),
    coffeePrefix: clash ? '0' : coffeePrefix,
    broodjiesPrefix: clash ? '1' : broodjiesPrefix,
    coffeeLabel: text(raw.coffeeLabel, 'Coffee'),
    broodjiesLabel: text(raw.broodjiesLabel, 'Broodjies'),
    showTimer: flag(raw.showTimer, true),
    showInput: flag(raw.showInput, true),
    colors: {
      background: text(raw.colors?.background, '#e5e7eb'),
      text: text(raw.colors?.text, '#0f172a'),
      accent: text(raw.colors?.accent, '#34d399'),
      accentText: text(raw.colors?.accentText, '#022c22'),
      border: text(raw.colors?.border, '#9ca3af'),
    },
  }
}

export const defaultSettings = parseSettings(json)

// Defaults with whatever was saved on this device laid on top.
export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return defaultSettings
    const saved: Raw = JSON.parse(stored)
    return parseSettings({
      ...defaultSettings,
      ...saved,
      colors: { ...defaultSettings.colors, ...saved.colors },
    })
  } catch {
    return defaultSettings
  }
}

export const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  } catch {
    // Storage unavailable: the settings last until the page is reloaded.
  }
}

export const clearSettings = () => {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // Nothing saved, nothing to clear.
  }
}

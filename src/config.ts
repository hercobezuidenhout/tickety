import json from './config.json'
import { isHexColor } from './colors'

export const ticketSizes = ['small', 'medium', 'large'] as const
export type TicketSize = (typeof ticketSizes)[number]
export const maxTicketColumns = 4

export type Settings = {
  stageSeconds: number
  ticketSize: TicketSize
  ticketColumns: number
  leftPrefix: string
  rightPrefix: string
  removePrefix: string
  leftLabel: string
  rightLabel: string
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

const hexColor = (value: unknown, fallback: string) =>
  isHexColor(value) ? value.toLowerCase() : fallback

const flag = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

// Prefixes are digits. Two prefixes clash when one starts with the other,
// because a typed number could then belong to either of them.
export const prefixesClash = (...prefixes: string[]) =>
  prefixes.some((a, i) => prefixes.slice(i + 1).some((b) => a.startsWith(b) || b.startsWith(a)))

const prefix = (value: unknown, fallback: string) =>
  typeof value === 'string' && /^\d+$/.test(value) ? value : fallback

const ticketSize = (value: unknown, fallback: TicketSize) =>
  ticketSizes.find((size) => size === value) ?? fallback

const ticketColumns = (value: unknown, fallback: number) =>
  Math.min(maxTicketColumns, Math.max(1, Math.floor(positiveNumber(value, fallback))))

export const parseSettings = (raw: Raw): Settings => {
  const leftPrefix = prefix(raw.leftPrefix, '0')
  const rightPrefix = prefix(raw.rightPrefix, '1')
  const removePrefix = prefix(raw.removePrefix, '3')
  const clash = prefixesClash(leftPrefix, rightPrefix, removePrefix)
  return {
    stageSeconds: positiveNumber(raw.stageSeconds, 60),
    ticketSize: ticketSize(raw.ticketSize, 'medium'),
    ticketColumns: ticketColumns(raw.ticketColumns, 1),
    leftPrefix: clash ? '0' : leftPrefix,
    rightPrefix: clash ? '1' : rightPrefix,
    removePrefix: clash ? '3' : removePrefix,
    leftLabel: text(raw.leftLabel, 'Coffee'),
    rightLabel: text(raw.rightLabel, 'Broodjies'),
    showTimer: flag(raw.showTimer, true),
    showInput: flag(raw.showInput, true),
    colors: {
      background: hexColor(raw.colors?.background, '#e5e7eb'),
      text: hexColor(raw.colors?.text, '#0f172a'),
      accent: hexColor(raw.colors?.accent, '#34d399'),
      accentText: hexColor(raw.colors?.accentText, '#022c22'),
      border: hexColor(raw.colors?.border, '#9ca3af'),
    },
  }
}

export const defaultSettings = parseSettings(json)

// Settings saved before the columns were renamed used coffee and broodjies in
// their keys. Carry those values over to the left and right keys.
const renamedKeys = {
  coffeePrefix: 'leftPrefix',
  broodjiesPrefix: 'rightPrefix',
  coffeeLabel: 'leftLabel',
  broodjiesLabel: 'rightLabel',
} as const

export const migrateSaved = (saved: Raw): Raw => {
  const migrated = { ...saved }
  for (const [old, current] of Object.entries(renamedKeys)) {
    if (old in migrated && !(current in migrated)) migrated[current] = migrated[old]
    delete migrated[old]
  }
  return migrated
}

// Defaults with whatever was saved on this device laid on top.
export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return defaultSettings
    const saved = migrateSaved(JSON.parse(stored))
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

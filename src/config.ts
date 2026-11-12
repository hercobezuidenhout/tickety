import json from './config.json'

// Values come from config.json at build time. Anything missing or invalid
// falls back to the defaults below.
const raw: Record<string, unknown> & { colors?: Record<string, unknown> } = json

const text = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback

const positiveNumber = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback

const flag = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

export const config = {
  stageMs: positiveNumber(raw.stageSeconds, 60) * 1000,
  servingColumns: Math.floor(positiveNumber(raw.servingColumns, 3)),

  servingLabel: text(raw.servingLabel, 'Now serving'),

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

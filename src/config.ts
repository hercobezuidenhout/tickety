const env = import.meta.env

const text = (value: string | undefined, fallback: string) =>
  value && value.trim() !== '' ? value : fallback

const positiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const flag = (value: string | undefined, fallback: boolean) =>
  value === undefined || value.trim() === ''
    ? fallback
    : value.trim().toLowerCase() !== 'false'

export const config = {
  expiryMs: positiveNumber(env.VITE_EXPIRY_SECONDS, 5 * 60) * 1000,
  maxPastOrders: Math.floor(positiveNumber(env.VITE_MAX_PAST_ORDERS, 8)),
  servingColumns: Math.floor(positiveNumber(env.VITE_SERVING_COLUMNS, 5)),

  servingLabel: text(env.VITE_SERVING_LABEL, 'Now serving'),
  pastLabel: text(env.VITE_PAST_LABEL, 'Past orders'),

  showTimer: flag(env.VITE_SHOW_TIMER, true),
  showInput: flag(env.VITE_SHOW_INPUT, true),

  colors: {
    background: text(env.VITE_COLOR_BACKGROUND, '#ffffff'),
    text: text(env.VITE_COLOR_TEXT, '#0f172a'),
    accent: text(env.VITE_COLOR_ACCENT, '#34d399'),
    accentText: text(env.VITE_COLOR_ACCENT_TEXT, '#ffffff'),
    border: text(env.VITE_COLOR_BORDER, '#e2e8f0'),
  },
}

export type Kind = 'left' | 'right'
export const kinds: Kind[] = ['left', 'right']

export type Order = { number: string; stageSince: number | null }
export type Orders = Record<Kind, Order[]>

export type OrdersAction =
  | { type: 'submit'; kind: Kind; number: string; now: number }
  | { type: 'remove'; number: string; now: number }
  | { type: 'tick'; now: number; stageMs: number }

export const emptyOrders: Orders = { left: [], right: [] }

// Stamp the order that is now first in line with the moment it reached the stage.
const promote = (list: Order[], now: number): Order[] =>
  list.length > 0 && list[0].stageSince === null
    ? [{ ...list[0], stageSince: now }, ...list.slice(1)]
    : list

// Removes the order on top once its time on stage is up and promotes the next.
const advance = (list: Order[], now: number, stageMs: number): Order[] => {
  const [hero, ...rest] = list
  if (!hero || hero.stageSince === null || now < hero.stageSince + stageMs) return list
  return promote(rest, now)
}

export const ordersReducer = (state: Orders, action: OrdersAction): Orders => {
  switch (action.type) {
    case 'submit': {
      const { kind, number, now } = action
      const list = state[kind]
      if (list[0]?.number === number) {
        return { ...state, [kind]: [{ ...list[0], stageSince: now }, ...list.slice(1)] }
      }
      if (list.some((o) => o.number === number)) return state
      return { ...state, [kind]: promote([...list, { number, stageSince: null }], now) }
    }
    case 'remove': {
      const { number, now } = action
      const removeFrom = (list: Order[]) => {
        const index = list.findIndex((o) => o.number === number)
        if (index === -1) return list
        const rest = list.filter((_, i) => i !== index)
        return index === 0 ? promote(rest, now) : rest
      }
      const left = removeFrom(state.left)
      const right = removeFrom(state.right)
      return left === state.left && right === state.right
        ? state
        : { left, right }
    }
    case 'tick': {
      const left = advance(state.left, action.now, action.stageMs)
      const right = advance(state.right, action.now, action.stageMs)
      return left === state.left && right === state.right
        ? state
        : { left, right }
    }
  }
}

export type Entry =
  | { type: 'submit'; kind: Kind; number: string }
  | { type: 'remove'; number: string }

// Reads what was typed. Starting with the remove prefix means the rest is an
// order number to take off every column. Otherwise the column prefix picks
// the column and the rest is the order number.
export const parseEntry = (
  value: string,
  prefixes: Record<Kind, string>,
  removePrefix: string,
): Entry | null => {
  if (value.startsWith(removePrefix)) {
    const number = value.slice(removePrefix.length)
    return number ? { type: 'remove', number } : null
  }
  const kind = kinds.find((k) => value.startsWith(prefixes[k]))
  if (!kind) return null
  const number = value.slice(prefixes[kind].length)
  return number ? { type: 'submit', kind, number } : null
}

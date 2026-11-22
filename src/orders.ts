export type Kind = 'coffee' | 'broodjies'
export const kinds: Kind[] = ['coffee', 'broodjies']

export type Order = { number: string; stageSince: number | null }
export type Orders = Record<Kind, Order[]>

export type OrdersAction =
  | { type: 'submit'; kind: Kind; number: string; now: number }
  | { type: 'remove'; kind: Kind; number: string; now: number }
  | { type: 'tick'; now: number; stageMs: number }

export const emptyOrders: Orders = { coffee: [], broodjies: [] }

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
      const { kind, number, now } = action
      const list = state[kind]
      const index = list.findIndex((o) => o.number === number)
      if (index === -1) return state
      const rest = list.filter((_, i) => i !== index)
      return { ...state, [kind]: index === 0 ? promote(rest, now) : rest }
    }
    case 'tick': {
      const coffee = advance(state.coffee, action.now, action.stageMs)
      const broodjies = advance(state.broodjies, action.now, action.stageMs)
      return coffee === state.coffee && broodjies === state.broodjies
        ? state
        : { coffee, broodjies }
    }
  }
}

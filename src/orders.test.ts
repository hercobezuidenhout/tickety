import { describe, expect, it } from 'vitest'
import { emptyOrders, ordersReducer, parseEntry, type Orders } from './orders'

const submit = (state: Orders, kind: 'left' | 'right', number: string, now: number) =>
  ordersReducer(state, { type: 'submit', kind, number, now })

describe('submit', () => {
  it('puts the first order straight on stage', () => {
    const state = submit(emptyOrders, 'left', '12', 1000)
    expect(state.left).toEqual([{ number: '12', stageSince: 1000 }])
  })

  it('queues later orders without a timer', () => {
    let state = submit(emptyOrders, 'left', '12', 1000)
    state = submit(state, 'left', '13', 2000)
    expect(state.left[1]).toEqual({ number: '13', stageSince: null })
  })

  it('keeps each column on its own line', () => {
    const state = submit(emptyOrders, 'left', '12', 1000)
    expect(submit(state, 'right', '12', 2000).right[0].stageSince).toBe(2000)
  })

  it('restarts the countdown when the number on top is typed again', () => {
    let state = submit(emptyOrders, 'left', '12', 1000)
    state = submit(state, 'left', '12', 5000)
    expect(state.left).toEqual([{ number: '12', stageSince: 5000 }])
  })

  it('ignores a number that is already waiting', () => {
    let state = submit(emptyOrders, 'left', '12', 1000)
    state = submit(state, 'left', '13', 2000)
    expect(submit(state, 'left', '13', 3000)).toBe(state)
  })
})

describe('remove', () => {
  const remove = (state: Orders, number: string, now: number) =>
    ordersReducer(state, { type: 'remove', number, now })

  const queued = () => {
    let state = submit(emptyOrders, 'left', '12', 0)
    state = submit(state, 'left', '13', 1000)
    return submit(state, 'left', '14', 2000)
  }

  it('promotes the next order when the top one is removed', () => {
    expect(remove(queued(), '12', 5000).left).toEqual([
      { number: '13', stageSince: 5000 },
      { number: '14', stageSince: null },
    ])
  })

  it('cancels a waiting order without touching the top timer', () => {
    expect(remove(queued(), '13', 5000).left).toEqual([
      { number: '12', stageSince: 0 },
      { number: '14', stageSince: null },
    ])
  })

  it('empties the column when the only order is removed', () => {
    expect(remove(submit(emptyOrders, 'left', '12', 0), '12', 5000).left).toEqual([])
  })

  it('removes the number from both columns at once', () => {
    let state = submit(emptyOrders, 'left', '12', 0)
    state = submit(state, 'right', '12', 1000)
    state = submit(state, 'right', '13', 2000)
    state = remove(state, '12', 5000)
    expect(state.left).toEqual([])
    expect(state.right).toEqual([{ number: '13', stageSince: 5000 }])
  })

  it('ignores a number that is in neither column', () => {
    const state = queued()
    expect(remove(state, '99', 5000)).toBe(state)
  })
})

describe('tick', () => {
  const stageMs = 60_000

  it('returns the same state while nothing has expired', () => {
    const state = submit(emptyOrders, 'left', '12', 0)
    expect(ordersReducer(state, { type: 'tick', now: 59_999, stageMs })).toBe(state)
  })

  it('removes the top order when its time is up and promotes the next', () => {
    let state = submit(emptyOrders, 'left', '12', 0)
    state = submit(state, 'left', '13', 10_000)
    state = ordersReducer(state, { type: 'tick', now: 60_000, stageMs })
    expect(state.left).toEqual([{ number: '13', stageSince: 60_000 }])
  })

  it('empties a column when the last order expires', () => {
    const state = submit(emptyOrders, 'left', '12', 0)
    expect(ordersReducer(state, { type: 'tick', now: 60_000, stageMs }).left).toEqual([])
  })

  it('advances each column independently', () => {
    let state = submit(emptyOrders, 'left', '12', 0)
    state = submit(state, 'right', '7', 30_000)
    state = ordersReducer(state, { type: 'tick', now: 60_000, stageMs })
    expect(state.left).toEqual([])
    expect(state.right).toEqual([{ number: '7', stageSince: 30_000 }])
  })
})

describe('parseEntry', () => {
  const prefixes = { left: '0', right: '1' }

  it('reads the column prefix and the order number', () => {
    expect(parseEntry('01234', prefixes, '3')).toEqual({ type: 'submit', kind: 'left', number: '1234' })
    expect(parseEntry('11234', prefixes, '3')).toEqual({ type: 'submit', kind: 'right', number: '1234' })
  })

  it('reads the rest after the remove prefix as the order number', () => {
    expect(parseEntry('31234', prefixes, '3')).toEqual({ type: 'remove', number: '1234' })
    expect(parseEntry('301', prefixes, '3')).toEqual({ type: 'remove', number: '01' })
  })

  it('supports prefixes longer than one digit', () => {
    expect(parseEntry('991234', { left: '01', right: '02' }, '99')).toEqual({
      type: 'remove',
      number: '1234',
    })
    expect(parseEntry('0155', { left: '01', right: '02' }, '99')).toEqual({
      type: 'submit',
      kind: 'left',
      number: '55',
    })
  })

  it('returns null when the prefix or the number is missing', () => {
    expect(parseEntry('5123', prefixes, '3')).toBeNull()
    expect(parseEntry('0', prefixes, '3')).toBeNull()
    expect(parseEntry('3', prefixes, '3')).toBeNull()
    expect(parseEntry('', prefixes, '3')).toBeNull()
  })
})

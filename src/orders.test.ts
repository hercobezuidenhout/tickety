import { describe, expect, it } from 'vitest'
import { emptyOrders, ordersReducer, type Orders } from './orders'

const submit = (state: Orders, kind: 'coffee' | 'broodjies', number: string, now: number) =>
  ordersReducer(state, { type: 'submit', kind, number, now })

describe('submit', () => {
  it('puts the first order straight on stage', () => {
    const state = submit(emptyOrders, 'coffee', '12', 1000)
    expect(state.coffee).toEqual([{ number: '12', stageSince: 1000 }])
  })

  it('queues later orders without a timer', () => {
    let state = submit(emptyOrders, 'coffee', '12', 1000)
    state = submit(state, 'coffee', '13', 2000)
    expect(state.coffee[1]).toEqual({ number: '13', stageSince: null })
  })

  it('keeps each column on its own line', () => {
    const state = submit(emptyOrders, 'coffee', '12', 1000)
    expect(submit(state, 'broodjies', '12', 2000).broodjies[0].stageSince).toBe(2000)
  })

  it('restarts the countdown when the number on top is typed again', () => {
    let state = submit(emptyOrders, 'coffee', '12', 1000)
    state = submit(state, 'coffee', '12', 5000)
    expect(state.coffee).toEqual([{ number: '12', stageSince: 5000 }])
  })

  it('ignores a number that is already waiting', () => {
    let state = submit(emptyOrders, 'coffee', '12', 1000)
    state = submit(state, 'coffee', '13', 2000)
    expect(submit(state, 'coffee', '13', 3000)).toBe(state)
  })
})

describe('remove', () => {
  const remove = (state: Orders, number: string, now: number) =>
    ordersReducer(state, { type: 'remove', kind: 'coffee', number, now })

  const queued = () => {
    let state = submit(emptyOrders, 'coffee', '12', 0)
    state = submit(state, 'coffee', '13', 1000)
    return submit(state, 'coffee', '14', 2000)
  }

  it('promotes the next order when the top one is removed', () => {
    expect(remove(queued(), '12', 5000).coffee).toEqual([
      { number: '13', stageSince: 5000 },
      { number: '14', stageSince: null },
    ])
  })

  it('cancels a waiting order without touching the top timer', () => {
    expect(remove(queued(), '13', 5000).coffee).toEqual([
      { number: '12', stageSince: 0 },
      { number: '14', stageSince: null },
    ])
  })

  it('empties the column when the only order is removed', () => {
    expect(remove(submit(emptyOrders, 'coffee', '12', 0), '12', 5000).coffee).toEqual([])
  })

  it('ignores a number that is not in the column', () => {
    const state = queued()
    expect(remove(state, '99', 5000)).toBe(state)
  })

  it('only looks in the named column', () => {
    const state = submit(emptyOrders, 'broodjies', '12', 0)
    expect(remove(state, '12', 5000)).toBe(state)
  })
})

describe('tick', () => {
  const stageMs = 60_000

  it('returns the same state while nothing has expired', () => {
    const state = submit(emptyOrders, 'coffee', '12', 0)
    expect(ordersReducer(state, { type: 'tick', now: 59_999, stageMs })).toBe(state)
  })

  it('removes the top order when its time is up and promotes the next', () => {
    let state = submit(emptyOrders, 'coffee', '12', 0)
    state = submit(state, 'coffee', '13', 10_000)
    state = ordersReducer(state, { type: 'tick', now: 60_000, stageMs })
    expect(state.coffee).toEqual([{ number: '13', stageSince: 60_000 }])
  })

  it('empties a column when the last order expires', () => {
    const state = submit(emptyOrders, 'coffee', '12', 0)
    expect(ordersReducer(state, { type: 'tick', now: 60_000, stageMs }).coffee).toEqual([])
  })

  it('advances each column independently', () => {
    let state = submit(emptyOrders, 'coffee', '12', 0)
    state = submit(state, 'broodjies', '7', 30_000)
    state = ordersReducer(state, { type: 'tick', now: 60_000, stageMs })
    expect(state.coffee).toEqual([])
    expect(state.broodjies).toEqual([{ number: '7', stageSince: 30_000 }])
  })
})

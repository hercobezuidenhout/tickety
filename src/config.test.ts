import { describe, expect, it } from 'vitest'
import { parseSettings, prefixesClash } from './config'

describe('prefixesClash', () => {
  it('accepts prefixes that none of the others start with', () => {
    expect(prefixesClash('0', '1', '3')).toBe(false)
  })

  it('flags two prefixes where one starts with the other', () => {
    expect(prefixesClash('1', '12')).toBe(true)
    expect(prefixesClash('0', '1', '10')).toBe(true)
  })
})

describe('parseSettings', () => {
  it('defaults the remove prefix to 3', () => {
    expect(parseSettings({}).removePrefix).toBe('3')
  })

  it('falls back to all default prefixes when the remove prefix clashes', () => {
    const settings = parseSettings({ coffeePrefix: '5', broodjiesPrefix: '6', removePrefix: '51' })
    expect([settings.coffeePrefix, settings.broodjiesPrefix, settings.removePrefix]).toEqual(['0', '1', '3'])
  })
})

import { describe, expect, it } from 'vitest'
import { migrateSaved, parseSettings, prefixesClash } from './config'

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
    const settings = parseSettings({ leftPrefix: '5', rightPrefix: '6', removePrefix: '51' })
    expect([settings.leftPrefix, settings.rightPrefix, settings.removePrefix]).toEqual(['0', '1', '3'])
  })
})

describe('parseSettings colours', () => {
  it('keeps valid hex colours, lowercased', () => {
    expect(parseSettings({ colors: { accent: '#FF0000' } }).colors.accent).toBe('#ff0000')
  })

  it('falls back to the default for anything that is not six digit hex', () => {
    const { colors } = parseSettings({ colors: { accent: 'red', text: '#12345', border: 5 } })
    expect(colors.accent).toBe('#34d399')
    expect(colors.text).toBe('#0f172a')
    expect(colors.border).toBe('#9ca3af')
  })
})

describe('migrateSaved', () => {
  it('moves the old coffee and broodjies keys to left and right', () => {
    expect(
      migrateSaved({ coffeePrefix: '5', broodjiesPrefix: '6', coffeeLabel: 'A', broodjiesLabel: 'B', stageSeconds: 30 }),
    ).toEqual({ leftPrefix: '5', rightPrefix: '6', leftLabel: 'A', rightLabel: 'B', stageSeconds: 30 })
  })

  it('prefers the new key when both are present', () => {
    expect(migrateSaved({ coffeePrefix: '5', leftPrefix: '7' })).toEqual({ leftPrefix: '7' })
  })
})

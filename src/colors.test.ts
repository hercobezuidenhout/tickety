import { describe, expect, it } from 'vitest'
import { contrastRatio, isHexColor } from './colors'

describe('isHexColor', () => {
  it('accepts six digit hex colours in either case', () => {
    expect(isHexColor('#34d399')).toBe(true)
    expect(isHexColor('#34D399')).toBe(true)
  })

  it('rejects anything else', () => {
    for (const value of ['#34d39', '#34d3999', '34d399', '#gggggg', 'red', '#fff', '', 12, null]) {
      expect(isHexColor(value)).toBe(false)
    }
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#34d399', '#34d399')).toBeCloseTo(1, 5)
  })

  it('passes AA for the default ticket and background pairs', () => {
    expect(contrastRatio('#34d399', '#022c22')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#e5e7eb', '#0f172a')).toBeGreaterThanOrEqual(4.5)
  })
})

import { calculateSeverity } from './calculateSeverities'

describe('calculateSeverity', () => {
  it('should', () => {
    const output = [0.1, 0.65, 0.76, 0.92].map((severity) => calculateSeverity(severity))
    expect(output).toEqual(['P4', 'P3', 'P2', 'P1'])
  })
})

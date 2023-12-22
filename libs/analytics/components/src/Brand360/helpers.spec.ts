import { computePastRange } from './helpers'


describe('helpers', () => {
  describe('computePastRange', () => {
    it('should handle last8hours', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2023-12-12T08:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-11T16:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle last24hours', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2023-12-13T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-11T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle last7days', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2023-12-19T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-05T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle last30days', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2024-01-11T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-11-12T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle custom', () => {
      const startDate = '2023-12-10T00:00:00+00:00'
      const endDate = '2023-12-12T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-08T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle allTime', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2024-03-12T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-09-12T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
  })
})

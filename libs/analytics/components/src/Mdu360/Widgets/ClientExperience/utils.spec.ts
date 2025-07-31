import { getPercentage, getSparklineData } from './utils'

describe('utils', () => {
  describe('getSparklineData', () => {
    it('should return sparkline data correctly', () => {
      const data = [0.1, 0.2, 0.3, 0.4, 0.5]
      const sparklineData = getSparklineData(data)
      expect(sparklineData).toEqual([0.1, 0.2, 0.3, 0.4, 0.5])
    })

    it('should return 0 for null values', () => {
      const data = [0.1, null, 0.3, null, 0.5]
      const sparklineData = getSparklineData(data)
      expect(sparklineData).toEqual([0.1, 0, 0.3, 0, 0.5])
    })
  })

  describe('getPercentage', () => {
    it('should return percentage and percentage text correctly', () => {
      const data = [0.1, 0.2, 0.3, 0.4, 0.5]
      const { percentage, percentageText } = getPercentage(data)
      expect(percentage).toBe(30)
      expect(percentageText).toBe('30%')
    })

    it('should return 0 when data is empty', () => {
      const data: number[] = []
      const { percentage, percentageText } = getPercentage(data)
      expect(percentage).toBe(0)
      expect(percentageText).toBe('0%')
    })

    it('should return 0 when data is all null', () => {
      const data = [null, null, null, null, null]
      const { percentage, percentageText } = getPercentage(data)
      expect(percentage).toBe(0)
      expect(percentageText).toBe('0%')
    })
  })
})

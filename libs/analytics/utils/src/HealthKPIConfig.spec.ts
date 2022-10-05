import { kpiConfig } from './HealthKPIConfig'

describe('Health KPI', () => {
  it('should format correctly', () => {
    const { histogram } = kpiConfig.timeToConnect
    const { barChart } = kpiConfig.connectionSuccess
    expect(histogram.shortXFormat(2000)).toBe(2)
    expect(barChart.shortXFormat('2022-10-01')).toBe('01')
    expect(barChart.longYFormat(10)).toBe('10%')
    expect(barChart.shortYFormat(10)).toBe('10%')
  })
})
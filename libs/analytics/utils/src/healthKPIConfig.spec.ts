import { kpiConfig, multipleBy1000, divideBy100, noFormat } from './healthKPIConfig'

describe('Health KPI', () => {
  it('should format correctly', () => {
    const { histogram } = kpiConfig.timeToConnect
    const { barChart } = kpiConfig.connectionSuccess

    expect(histogram.shortXFormat(2000)).toBe(2)
    expect(barChart.shortXFormat('2022-10-01')).toBe('01')
    expect(barChart.longYFormat(10)).toBe('10%')
    expect(barChart.shortYFormat(10)).toBe('10%')
    expect(barChart.shortYFormat(10)).toBe('10%')
    expect(kpiConfig.apServiceUptime.histogram.shortXFormat(10)).toBe(1000)
    expect(kpiConfig.switchPoeUtilization.histogram.shortXFormat(10)).toBe(1000)
    expect(kpiConfig.rss.histogram.shortXFormat(10)).toBe(10)
    expect(kpiConfig.apToSZLatency.histogram.shortXFormat(10)).toBe(10)
    expect(multipleBy1000(10)).toBe(10000)
    expect(divideBy100(100)).toBe(1)
    expect(noFormat(100)).toBe(100)

  })
})

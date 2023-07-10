
import { get } from '@acx-ui/config'

import { kpiConfig, multipleBy1000, divideBy100, noFormat, kpisForTab, apToSZLatencyConfig, apServiceUptimeConfig } from './healthKPIConfig'

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

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
    expect(kpiConfig.clusterLatency.histogram.shortXFormat(10)).toBe(10)
    expect(kpiConfig.apToSZLatency.histogram.shortXFormat(10)).toBe(10)
    expect(multipleBy1000(10)).toBe(10000)
    expect(divideBy100(100)).toBe(1)
    expect(noFormat(100)).toBe(100)

  })
  it('apToSZLatencyConfig should return correct values for RA', () => {
    mockGet.mockReturnValue('true')
    expect(apToSZLatencyConfig('text').defaultMessage)
      .toEqual([{ type: 0, value: 'AP-to-SZ Latency' }])
    expect(apToSZLatencyConfig('initialThreshold'))
      .toEqual(40)
    expect(apToSZLatencyConfig('splits'))
      .toEqual([5, 10, 20, 40, 60, 100, 200, 500])
    expect(apToSZLatencyConfig('tooltip').defaultMessage)
    /* eslint-disable max-len */
      .toEqual([{ type: 0, value: 'The time-series graph on the left displays the percentage of APs that have AP-to-SZ control plane latency which meets the configured SLA. The bar chart on the right captures the distribution of the latency across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' }])
  })

  it('apServiceUptimeConfig should return correct values for RA', () => {
    mockGet.mockReturnValue('true')
    expect(apServiceUptimeConfig('text').defaultMessage)
      .toEqual([{ type: 0, value: 'AP-Controller Connection Uptime' }])
    expect(apServiceUptimeConfig('tooltip').defaultMessage)
    /* eslint-disable max-len */
      .toEqual([{ type: 0, value: 'AP-Controller connection uptime measures the percentage of time the AP radios are fully available for client service. The time-series graph on the left displays the percentage of AP-Controller connection uptime samples across time that meets the configured SLA. The bar chart on the right displays the distribution of AP service uptime across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' }])})

  it('should return correct config for RA', () => {
    expect(kpisForTab('true')).toMatchObject({
      infrastructure: {
        kpis: [
          'apServiceUptime',
          'apToSZLatency',
          'clusterLatency',
          'switchPoeUtilization',
          'onlineAPs'
        ]
      }
    })
  })
  it('should return correct config for ACX', () => {
    expect(kpisForTab(undefined)).toMatchObject({
      infrastructure: {
        kpis: [
          'apServiceUptime',
          'apToSZLatency',
          'switchPoeUtilization',
          'onlineAPs'
        ]
      }
    })
  })
})

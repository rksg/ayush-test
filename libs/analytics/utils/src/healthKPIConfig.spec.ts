import { multipleBy1000, divideBy100, noFormat,
  kpisForTab, wiredKPIsForTab,
  numberWithPercentSymbol, shouldAddFirmwareFilter } from './healthKPIConfig'

describe('Health KPI', () => {
  const mockGet = jest.fn()
  beforeEach(() => {
    jest.resetModules()
    require('@acx-ui/utils').setUpIntl({ locale: 'en-US', messages: {} })
    jest.doMock('@acx-ui/config', () => ({ get: mockGet }))
  })
  it('returns config for R1', () => {
    mockGet.mockReturnValue(undefined)
    const { kpiConfig } = require('./healthKPIConfig')
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
    expect(numberWithPercentSymbol(100)).toBe('100%')
    expect(kpiConfig.apToSZLatency.histogram.initialThreshold).toBe(200)
    expect(kpiConfig.apToSZLatency.histogram.splits)
      .toEqual([50, 100, 150, 200, 250, 300, 350, 400])
  })
  it('returns config for RA', () => {
    mockGet.mockReturnValue('true')
    const { kpiConfig } = require('./healthKPIConfig')
    expect(kpiConfig.apToSZLatency.histogram.initialThreshold).toBe(40)
    expect(kpiConfig.apToSZLatency.histogram.splits)
      .toEqual([5, 10, 20, 40, 60, 100, 200, 500])
  })
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
  it('should return correct config for wired in RA', () => {
    expect(wiredKPIsForTab()).toMatchObject({
      overview: {
        kpis: [
          'switchUplinkPortUtilization'
        ]
      },
      connection: {
        kpis: [
          'switchAuthentication'
        ]
      },
      performance: {
        kpis: [
          'switchPortUtilization',
          'switchUplinkPortUtilization'
        ]
      },
      infrastructure: {
        kpis: [
          'switchMemoryUtilization',
          'switchCpuUtilization',
          'switchesTemperature',
          'switchPoeUtilization'
        ]
      }
    })
  })
  it('should return correct config for wired in RA with kpi 10010e FF', () => {
    expect(wiredKPIsForTab(true)).toMatchObject({
      overview: {
        kpis: [
          'switchUplinkPortUtilization'
        ]
      },
      connection: {
        kpis: [
          'switchAuthentication',
          'switchDhcp'
        ]
      },
      performance: {
        kpis: [
          'switchPortUtilization',
          'switchUplinkPortUtilization',
          'switchInterfaceAnomalies',
          'switchStormControl'
        ]
      },
      infrastructure: {
        kpis: [
          'switchMemoryUtilization',
          'switchCpuUtilization',
          'switchesTemperature',
          'switchPoeUtilization'
        ]
      }
    })
  })
  describe('shouldAddFirmwareFilter', () => {
    const mockPathname = jest.fn()
    Object.defineProperty(window, 'location', {
      value: {
        get pathname () {
          return mockPathname()
        }
      }
    })
    it('should return undefined if path name does not have wired', () => {
      mockPathname.mockReturnValue('/health/overview')
      expect(shouldAddFirmwareFilter()).toBe(undefined)
    })
    it('should return true if path name has wired', () => {
      mockPathname.mockReturnValue('/health/wired')
      expect(shouldAddFirmwareFilter()).toBe(true)
    })
  })
})

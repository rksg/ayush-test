import { SLAKeys } from '../../types'
import { SLAData } from '../SLA/types'

import { getConfig, getPercentage, getSparklineData } from './utils'

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

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

  describe('getConfig', () => {
    it('should return config with threshold values in short text correctly', () => {
      const thresholds = {
        [SLAKeys.clientThroughputSLA]: {
          value: 10000,
          isSynced: true,
          isDefault: false
        },
        [SLAKeys.timeToConnectSLA]: {
          value: 2000,
          isSynced: true,
          isDefault: false
        }
      } as SLAData
      const config = getConfig(thresholds)
      expect(config).toEqual({
        [SLAKeys.connectionSuccessSLA]: {
          title: 'Connection Success'
        },
        [SLAKeys.clientThroughputSLA]: {
          title: 'Wireless Client Throughput',
          shortText: 'About 10 Mbps'
        },
        [SLAKeys.timeToConnectSLA]: {
          title: 'Time to Connect',
          shortText: 'Under 2 s'
        },
        [SLAKeys.channelWidthSLA]: {
          title: 'Channel Width Experience'
        },
        [SLAKeys.channelChangeExperienceSLA]: {
          title: 'Channel Change Experience'
        }
      })
    })

    it('should return config with "multiple values" short text when threshold is not synced',
      () => {
        const thresholds = {
          [SLAKeys.clientThroughputSLA]: {
            value: 10000,
            isSynced: false,
            isDefault: false
          },
          [SLAKeys.timeToConnectSLA]: {
            value: 2000,
            isSynced: false,
            isDefault: false
          }
        } as SLAData
        const config = getConfig(thresholds)
        expect(config).toEqual({
          [SLAKeys.connectionSuccessSLA]: {
            title: 'Connection Success'
          },
          [SLAKeys.clientThroughputSLA]: {
            title: 'Wireless Client Throughput',
            shortText: 'Multiple values'
          },
          [SLAKeys.timeToConnectSLA]: {
            title: 'Time to Connect',
            shortText: 'Multiple values'
          },
          [SLAKeys.channelWidthSLA]: {
            title: 'Channel Width Experience'
          },
          [SLAKeys.channelChangeExperienceSLA]: {
            title: 'Channel Change Experience'
          }
        })
      })

    it('should return no short text when thresholds is empty', () => {
      const thresholds = {} as SLAData
      const config = getConfig(thresholds)
      expect(config).toEqual({
        [SLAKeys.connectionSuccessSLA]: {
          title: 'Connection Success'
        },
        [SLAKeys.clientThroughputSLA]: {
          title: 'Wireless Client Throughput',
          shortText: undefined
        },
        [SLAKeys.timeToConnectSLA]: {
          title: 'Time to Connect',
          shortText: undefined
        },
        [SLAKeys.channelWidthSLA]: {
          title: 'Channel Width Experience'
        },
        [SLAKeys.channelChangeExperienceSLA]: {
          title: 'Channel Change Experience'
        }
      })
    })
  })
})

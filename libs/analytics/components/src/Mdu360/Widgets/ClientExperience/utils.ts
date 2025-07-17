import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { defaultThreshold } from '../../../Health/Kpi'

export enum SLAKeys {
  connectionSuccessSLA = 'connectionSuccessSLA',
  clientThroughputSLA = 'clientThroughputSLA',
  timeToConnectSLA = 'timeToConnectSLA'
}

interface SLAConfig {
  starRatingTitle: string
  sparklineTitle: string
  shortText?: string
}

type TimeseriesData = Array<number | null>

export const getSparklineData = (data: TimeseriesData) => data.map((value) => (value ? value : 0))

export const getPercentage = (data: TimeseriesData) => {
  const sum = data.reduce(
    (acc: number, curr: number | null) => acc + (curr ?? 0),
    0
  )
  const ratio = sum === 0 ? 0 : sum / data.length
  const percentage = ratio * 100
  return { percentage, percentageText: formatter('percentFormatRound')(ratio) }
}

export const getConfig = (): Record<SLAKeys, SLAConfig> => {
  const { $t } = getIntl()
  return {
    [SLAKeys.connectionSuccessSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Connection Success' }),
      sparklineTitle: $t({ defaultMessage: 'Connection Success' }),
      shortText: $t(
        { defaultMessage: 'About {threshold}' },
        {
          threshold: formatter('networkSpeedFormat')(defaultThreshold.clientThroughput)
        }
      )
    },
    [SLAKeys.clientThroughputSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Wireless Client Throughput' }),
      sparklineTitle: $t({ defaultMessage: 'Throughput Wi-Fi' })
    },
    [SLAKeys.timeToConnectSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Time to Connect' }),
      sparklineTitle: $t({ defaultMessage: 'Time to Connect' }),
      shortText: $t(
        { defaultMessage: 'Under {threshold}' },
        {
          threshold: formatter('durationFormat')(defaultThreshold.timeToConnect)
        }
      )
    }
  }
}
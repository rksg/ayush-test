import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { SLAKeys } from '../../types'
import { SLAData } from '../SLA/services'

export interface SLAConfig {
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

export const getConfig = (
  thresholds: SLAData
): Record<SLAKeys, SLAConfig> => {
  const { $t } = getIntl()
  const multipleValuesShortText = $t({ defaultMessage: 'Multiple values' })

  const getClientThroughputShortText = () => {
    const sla = thresholds[SLAKeys.clientThroughputSLA]
    if (!sla) {
      return undefined
    }
    return sla.isSynced
      ? $t(
        { defaultMessage: 'About {threshold}' },
        { threshold: formatter('networkSpeedFormat')(sla.value) }
      )
      : multipleValuesShortText
  }

  const getTimeToConnectShortText = () => {
    const sla = thresholds[SLAKeys.timeToConnectSLA]
    if (!sla) {
      return undefined
    }
    return sla.isSynced
      ? $t(
        { defaultMessage: 'Under {threshold}' },
        { threshold: formatter('durationFormat')(sla.value) }
      )
      : multipleValuesShortText
  }
  return {
    [SLAKeys.connectionSuccessSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Connection Success' }),
      sparklineTitle: $t({ defaultMessage: 'Connection Success' })
    },
    [SLAKeys.clientThroughputSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Wireless Client Throughput' }),
      sparklineTitle: $t({ defaultMessage: 'Throughput Wi-Fi' }),
      shortText: getClientThroughputShortText()
    },
    [SLAKeys.timeToConnectSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Time to Connect' }),
      sparklineTitle: $t({ defaultMessage: 'Time to Connect' }),
      shortText: getTimeToConnectShortText()
    },
    [SLAKeys.channelWidthSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Channel Width Experience' }),
      sparklineTitle: $t({ defaultMessage: 'Channel Width' })
    },
    [SLAKeys.channelChangeExperienceSLA]: {
      starRatingTitle: $t({ defaultMessage: 'Channel Change Experience' }),
      sparklineTitle: $t({ defaultMessage: 'Channel Change Experience' })
    }
  }
}

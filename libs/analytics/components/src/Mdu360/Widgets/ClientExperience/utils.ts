import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { SLAKeys }           from '../../types'
import { SLAConfigWithData } from '../SLA/types'

import { SLAConfig, TimeseriesData } from './types'

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
  thresholds: SLAConfigWithData[]
): Record<SLAKeys, SLAConfig> => {
  const { $t } = getIntl()
  const multipleValuesShortText = $t({ defaultMessage: 'Multiple values' })

  const getClientThroughputShortText = () => {
    const sla = thresholds.find(
      ({ slaKey }) => slaKey === SLAKeys.clientThroughputSLA
    )
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
    const sla = thresholds.find(
      ({ slaKey }) => slaKey === SLAKeys.timeToConnectSLA
    )
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
      title: $t({ defaultMessage: 'Connection Success' })
    },
    [SLAKeys.clientThroughputSLA]: {
      title: $t({ defaultMessage: 'Wireless Client Throughput' }),
      shortText: getClientThroughputShortText()
    },
    [SLAKeys.timeToConnectSLA]: {
      title: $t({ defaultMessage: 'Time to Connect' }),
      shortText: getTimeToConnectShortText()
    },
    [SLAKeys.channelWidthSLA]: {
      title: $t({ defaultMessage: 'Channel Width Experience' })
    },
    [SLAKeys.channelChangeExperienceSLA]: {
      title: $t({ defaultMessage: 'Channel Change Experience' })
    }
  }
}

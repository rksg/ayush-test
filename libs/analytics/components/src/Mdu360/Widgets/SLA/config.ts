import { defineMessage } from 'react-intl'

import { kpiConfig } from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { defaultThreshold } from '../../../Health/Kpi'
import { SLAKeys }          from '../../types'

import { SLAConfig, SLAConfigWithData, SLAData, SLAResult } from './types'

const defaultFormatter = (value: number) => value

const getShortText = (slaKey: SLAKeys, sla: SLAResult) => {
  const { $t } = getIntl()
  const multipleValuesShortText = $t({ defaultMessage: 'Multiple values' })
  if (slaKey === SLAKeys.clientThroughputSLA) {
    return sla.isSynced
      ? $t(
        { defaultMessage: 'Above {threshold}' },
        { threshold: formatter('networkSpeedFormat')(sla.value) }
      )
      : multipleValuesShortText
  }
  if (slaKey === SLAKeys.timeToConnectSLA) {
    return sla.isSynced
      ? $t(
        { defaultMessage: 'Under {threshold}' },
        { threshold: formatter('durationFormat')(sla.value) }
      )
      : multipleValuesShortText
  }
  return undefined
}

export const slaConfigWithData = (data: SLAData): SLAConfigWithData[] =>
  Object.entries(slaConfig).flatMap(([key, config]) => {
    const slaKey = key as SLAKeys
    let sla = data[slaKey]
    sla = {
      ...sla,
      isSynced: sla?.isSynced ?? true,
      value: sla?.value ?? config.defaultValue ?? null
    }
    const shortText = getShortText(slaKey, sla)

    return [
      {
        ...config,
        ...sla,
        slaKey,
        shortText
      }
    ]
  })

// Default and splits value must be populated to have a slider
export const slaConfig: Record<SLAKeys, SLAConfig> = {
  [SLAKeys.clientThroughputSLA]: {
    splits: kpiConfig.clientThroughput.histogram.splits,
    defaultValue: defaultThreshold.clientThroughput,
    formatter: kpiConfig.clientThroughput.histogram.shortXFormat,
    units: kpiConfig.clientThroughput.histogram.xUnit,
    title: defineMessage({ defaultMessage: 'Wireless Client Throughput' }),
    apiMetric: kpiConfig.clientThroughput.histogram.apiMetric
  },
  [SLAKeys.channelWidthSLA]: {
    splits: [20, 40, 80, 160, 320],
    defaultValue: 80,
    formatter: defaultFormatter,
    units: defineMessage({ defaultMessage: 'Mbps' }),
    title: defineMessage({ defaultMessage: 'Channel Width' }),
    apiMetric: 'channelWidthExperience'
  },
  [SLAKeys.channelChangeExperienceSLA]: {
    splits: [0, 10, 25, 50],
    defaultValue: 25,
    formatter: defaultFormatter,
    title: defineMessage({ defaultMessage: 'Channel Change Per Day' }),
    apiMetric: 'channelChangeExperience'
  },
  [SLAKeys.timeToConnectSLA]: {
    splits: kpiConfig.timeToConnect.histogram.splits,
    defaultValue: defaultThreshold.timeToConnect,
    formatter: kpiConfig.timeToConnect.histogram.shortXFormat,
    units: kpiConfig.timeToConnect.histogram.xUnit,
    title: defineMessage({ defaultMessage: 'Time to Connect' }),
    apiMetric: kpiConfig.timeToConnect.histogram.apiMetric
  },
  [SLAKeys.connectionSuccessSLA]: {
    formatter: defaultFormatter,
    title: defineMessage({ defaultMessage: 'Connection Success' }),
    apiMetric: 'connectionSuccess'
  }
}

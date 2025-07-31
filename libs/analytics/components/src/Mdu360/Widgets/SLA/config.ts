import { defineMessage } from 'react-intl'

import { kpiConfig } from '@acx-ui/analytics/utils'

import { defaultThreshold } from '../../../Health/Kpi'
import { SLAKeys }          from '../../types'

import { SLAConfig, SLAConfigWithData, SLAData } from './types'

const defaultFormatter = (value: number) => value

export const slaConfigWithData = (data: SLAData): SLAConfigWithData[] =>
  Object.entries(slaConfig).flatMap(([key, config]) => {
    const slaKey = key as SLAKeys
    const sla = data[slaKey]
    const slaValue: number | undefined = sla?.value || config.defaultValue
    if (!sla || slaValue == null || !config.splits) {
      return []
    }
    return [{ ...config, ...sla, value: slaValue, splits: config.splits, slaKey }]
  })

// Default and splits value must be populated to have a slider
export const slaConfig: Record<SLAKeys, SLAConfig> = {
  [SLAKeys.clientThroughputSLA]: {
    splits: kpiConfig.clientThroughput.histogram.splits,
    defaultValue: defaultThreshold.clientThroughput,
    formatter: kpiConfig.clientThroughput.histogram.shortXFormat,
    units: kpiConfig.clientThroughput.histogram.xUnit,
    title: defineMessage({ defaultMessage: 'Throughput Wi-Fi' }),
    apiMetric: kpiConfig.clientThroughput.histogram.apiMetric
  },
  [SLAKeys.channelWidthSLA]: {
    splits: [20, 40, 80, 160, 320],
    defaultValue: 20,
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

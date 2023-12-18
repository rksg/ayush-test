import _                                    from 'lodash'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { mapCodeToReason, Incident } from '@acx-ui/analytics/utils'
import { formatter }                 from '@acx-ui/formatter'
import { getIntl }                   from '@acx-ui/utils'

import { apRebootReasonMap }      from './apRebootReasonMap'
import { NetworkImpactChartData } from './services'

export type NetworkImpactType = 'ap'
| 'client'
| 'apDowntime'
| 'apReboot'
| 'apRebootEvent'
| 'apInfra'
| 'airtimeMetric'
| 'airtimeFrame'
| 'airtimeCast'

export enum NetworkImpactChartTypes {
  APFwVersionByAP = 'apFwVersionByAP',
  APModel = 'apModel',
  APModelByAP = 'apModelByAP',
  APVersion = 'apVersion',
  ClientManufacturer = 'clientManufacturer',
  EventTypeByAP = 'eventTypeByAP',
  OS = 'os',
  Radio = 'radio',
  RebootReasonByAP = 'rebootReasonByAP',
  RebootReasonsByEvent = 'rebootReasonsByEvent',
  Reason = 'reason',
  ReasonByAP = 'reasonByAP',
  WLAN = 'WLAN',
  AirtimeBusy = 'airtimeBusy',
  AirtimeTx = 'airtimeTx',
  AirtimeRx = 'airtimeRx',
  AirtimeMgmtFrame = 'airtimeMgmtFrame',
  AirtimeCast = 'airtimeCast'
}

export enum NetworkImpactQueryTypes {
  TopN = 'topN',
  Distribution = 'distribution'
}

export type NetworkImpactChartConfig = {
  chart: NetworkImpactChartTypes
  query: NetworkImpactQueryTypes
  type: NetworkImpactType
  dimension: string
}

export type DominanceSummary = {
  dominance: MessageDescriptor,
  broad: MessageDescriptor
}

export interface NetworkImpactChart {
  title: MessageDescriptor
  tooltipFormat: MessageDescriptor
  dataFomatter?: (value: unknown, tz?: string | undefined) => string
  dominanceFn?: (data: NetworkImpactChartData['data'], incident: Incident) => {
    key: string
    value: number
    percentage: number
  } | null,
  transformKeyFn?: (key: string) => string
  transformValueFn?: (val: number) => number
  summary: DominanceSummary | MessageDescriptor
}

export const getDataWithPercentage = (data: NetworkImpactChartData['data']) => {
  const sum = _.sumBy(data, 'value')
  return data.map(({ key, value }) => ({ key, value, percentage: !sum ? 0 : value / sum }))
}

export const getDominance = (data: NetworkImpactChartData['data']) =>
  _.maxBy(getDataWithPercentage(data), 'percentage')

export const getAPRebootReason = (key: string) => {
  const { $t } = getIntl()
  const content = _.get(apRebootReasonMap, key.replace(/cubic/ig, 'cia'))
  return content ? $t(content) : key
}

export const transformAirtimeMetricKey = (key: string) => {
  const { $t } = getIntl()
  const map = {
    airtimeBusy: $t({ defaultMessage: 'Airtime Busy' }),
    airtimeRx: $t({ defaultMessage: 'Airtime Rx' }),
    airtimeTx: $t({ defaultMessage: 'Airtime Tx' }),
    airtimeIdle: $t({ defaultMessage: 'Airtime Idle' })
  }
  return _.get(map, key, '')
}

export const transformAirtimeFrame = (key: string) => {
  const { $t } = getIntl()
  const map = {
    mgmtFrames: $t({ defaultMessage: 'Mgmt. Frames' }),
    dataFrames: $t({ defaultMessage: 'Data Frames' })
  }
  return _.get(map, key, '')
}

export const transformAirtimeCast= (key: string) => {
  const { $t } = getIntl()
  const map = {
    txUnicastFrames: $t({ defaultMessage: 'Unicast Frames' }),
    txBoardcastFrames: $t({ defaultMessage: 'Boardcast Frames' }),
    txMulticaseFrames: $t({ defaultMessage: 'Multicast Frames' })
  }
  return _.get(map, key, '')
}

const dominanceThreshold = 0.7

export const getDominanceByThreshold = (threshold: number = dominanceThreshold) => (
  data: NetworkImpactChartData['data']
) => {
  const max = getDominance(data)
  return (max && max.percentage > threshold && max.key !== 'Others') ? max : null
}

export const getWLANDominance = (
  data: NetworkImpactChartData['data'], incident: Incident
) => {
  const dominant = incident.metadata.dominant?.ssid
  const percentage = getDataWithPercentage(data)
  return _.pickBy(percentage, p => p.key === dominant)[1] || null
}

const tooltipFormats = {
  clients: defineMessage({
    defaultMessage: `{name}<br></br>
    <space><b>{formattedValue} {value, plural,
      one {client}
      other {clients}
    }</b></space>`
  }),
  aps: defineMessage({
    defaultMessage: `{name}<br></br>
    <space><b>{formattedValue} {value, plural,
      one {AP}
      other {APs}
    }</b></space>`
  }),
  events: defineMessage({
    defaultMessage: `{name}<br></br>
    <space><b>{formattedValue} {value, plural,
      one {event}
      other {events}
    }</b></space>`
  }),
  distribution: defineMessage({
    defaultMessage: `{name}<br></br>
    <space><b>{formattedValue}</b></space>`
  })
}

const dominanceFormats = {
  ofTarget: defineMessage({
    defaultMessage: '{percentage} of failures impacted {dominant}'
  }),
  ofReason: defineMessage({
    defaultMessage: "{percentage} of failures caused by ''{dominant}''"
  })
}

export const networkImpactChartConfigs: Readonly<Record<
  NetworkImpactChartTypes,
  NetworkImpactChart
>> = {
  [NetworkImpactChartTypes.APFwVersionByAP]: {
    title: defineMessage({ defaultMessage: 'AP Firmware' }),
    tooltipFormat: tooltipFormats.aps,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {AP firmware}
          other {AP firmwares}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.APModel]: {
    title: defineMessage({ defaultMessage: 'AP Model' }),
    tooltipFormat: tooltipFormats.clients,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {AP model}
          other {AP models}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.APModelByAP]: {
    title: defineMessage({ defaultMessage: 'AP Model' }),
    tooltipFormat: tooltipFormats.aps,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {AP model}
          other {AP models}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.APVersion]: {
    title: defineMessage({ defaultMessage: 'AP Version' }),
    tooltipFormat: tooltipFormats.clients,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {AP firmware}
          other {AP firmwares}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.ClientManufacturer]: {
    title: defineMessage({ defaultMessage: 'Client Manufacturer' }),
    tooltipFormat: tooltipFormats.clients,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {client manufacturer}
          other {client manufacturers}
        }` })
    }
  },
  [NetworkImpactChartTypes.EventTypeByAP]: {
    title: defineMessage({ defaultMessage: 'Event Type' }),
    tooltipFormat: tooltipFormats.aps,
    summary: {
      dominance: dominanceFormats.ofReason,
      broad: defineMessage({
        defaultMessage: `{count} {count, plural,
          one {event type}
          other {event types}
        } contributed to this incident`
      })
    }
  },
  [NetworkImpactChartTypes.OS]: {
    title: defineMessage({ defaultMessage: 'OS' }),
    tooltipFormat: tooltipFormats.clients,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {operating system}
          other {operating systems}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.Radio]: {
    title: defineMessage({ defaultMessage: 'Radio' }),
    transformKeyFn: (val: string) => formatter('radioFormat')(val) as string,
    tooltipFormat: tooltipFormats.clients,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {radio}
          other {radios}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.Reason]: {
    title: defineMessage({ defaultMessage: 'Reason' }),
    transformKeyFn: mapCodeToReason,
    tooltipFormat: tooltipFormats.clients,
    summary: {
      dominance: defineMessage({
        defaultMessage: "{percentage} of failures caused by ''{dominant}''" }),
      broad: defineMessage({
        defaultMessage: `{count} {count, plural,
          one {reason}
          other {reasons}
        } contributed to this incident`
      })
    }
  },
  [NetworkImpactChartTypes.ReasonByAP]: {
    title: defineMessage({ defaultMessage: 'Reason' }),
    tooltipFormat: tooltipFormats.aps,
    transformKeyFn: getAPRebootReason,
    summary: {
      dominance: dominanceFormats.ofReason,
      broad: defineMessage({
        defaultMessage: `{count} {count, plural,
          one {reason}
          other {reasons}
        } contributed to this incident`
      })
    }
  },
  [NetworkImpactChartTypes.RebootReasonByAP]: {
    title: defineMessage({ defaultMessage: 'Reason by AP' }),
    tooltipFormat: tooltipFormats.aps,
    transformKeyFn: getAPRebootReason,
    summary: {
      dominance: dominanceFormats.ofReason,
      broad: defineMessage({
        defaultMessage: `{count} {count, plural,
          one {reason}
          other {reasons}
        } contributed to this incident`
      })
    }
  },
  [NetworkImpactChartTypes.RebootReasonsByEvent]: {
    title: defineMessage({ defaultMessage: 'Reason by Event' }),
    tooltipFormat: tooltipFormats.aps,
    transformKeyFn: getAPRebootReason,
    summary: {
      dominance: dominanceFormats.ofReason,
      broad: defineMessage({
        defaultMessage: `{count} {count, plural,
          one {reason}
          other {reasons}
        } contributed to this incident`
      })
    }
  },
  [NetworkImpactChartTypes.WLAN]: {
    title: defineMessage({ defaultMessage: 'WLAN' }),
    tooltipFormat: tooltipFormats.clients,
    dominanceFn: getWLANDominance,
    summary: {
      dominance: dominanceFormats.ofTarget,
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {WLAN}
          other {WLANs}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.AirtimeBusy]: {
    title: defineMessage({ defaultMessage: 'Airtime Busy' }),
    tooltipFormat: tooltipFormats.distribution,
    dataFomatter: formatter('percentFormat'),
    transformKeyFn: transformAirtimeMetricKey,
    summary: defineMessage({ defaultMessage: 'Peak airtime busy was {count}' })
  },
  [NetworkImpactChartTypes.AirtimeTx]: {
    title: defineMessage({ defaultMessage: 'Airtime Tx' }),
    tooltipFormat: tooltipFormats.distribution,
    dataFomatter: formatter('percentFormat'),
    transformKeyFn: transformAirtimeMetricKey,
    summary: defineMessage({ defaultMessage: 'Peak airtime Tx was {count}' })
  },
  [NetworkImpactChartTypes.AirtimeRx]: {
    title: defineMessage({ defaultMessage: 'Airtime Rx' }),
    tooltipFormat: tooltipFormats.distribution,
    dataFomatter: formatter('percentFormat'),
    transformKeyFn: transformAirtimeMetricKey,
    summary: defineMessage({ defaultMessage: 'Peak airtime Rx was {count}' })
  },
  [NetworkImpactChartTypes.AirtimeMgmtFrame]: {
    title: defineMessage({ defaultMessage: 'Average % of mgmt. frames' }),
    tooltipFormat: tooltipFormats.distribution,
    transformKeyFn: transformAirtimeFrame,
    summary: defineMessage({ defaultMessage: 'Peak percentage of mgmt. frames was {count}' })
  },
  [NetworkImpactChartTypes.AirtimeCast]: {
    title: defineMessage({ defaultMessage: 'Average % of MC & BC frames' }),
    tooltipFormat: tooltipFormats.distribution,
    transformKeyFn: transformAirtimeCast,
    summary: defineMessage({ defaultMessage: 'Peak percentage of MC & BC frames was {count}' })
  }
}

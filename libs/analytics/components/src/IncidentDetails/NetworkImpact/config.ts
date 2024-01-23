import _                                    from 'lodash'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { mapCodeToReason, Incident } from '@acx-ui/analytics/utils'
import { qualitativeColorSet }       from '@acx-ui/components'
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
| 'rogueAp'
| 'apAirtime'
| 'airtimeMetric'
| 'airtimeFrame'
| 'airtimeCast'
| 'airtimeClientsByAP'

export enum NetworkImpactChartTypes {
  AirtimeBusy = 'airtimeBusy',
  AirtimeCast = 'airtimeCast',
  AirtimeClientsByAP = 'airtimeClientsByAP',
  AirtimeMgmtFrame = 'airtimeMgmtFrame',
  AirtimeRx = 'airtimeRx',
  AirtimeTx = 'airtimeTx',
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
  RogueAPByChannel = 'rogueAPByChannel',
  RxPhyErrByAP = 'rxPhyErrByAP',
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
  /**
   * @description prevent query from firing
   * @default false
   **/
  disabled?: boolean
  showTotal?: boolean
}

export type DominanceSummary = {
  dominance: MessageDescriptor,
  broad: MessageDescriptor
}

export interface NetworkImpactChart {
  title: MessageDescriptor
  tooltipFormat: MessageDescriptor
  dataFomatter?: (value: unknown, tz?: string | undefined) => string
  valueFormatter?: (value: unknown, tz?: string | undefined) => string
  dominanceFn?: (data: NetworkImpactChartData['data'], incident: Incident) => {
    key: string
    value: number
    percentage: number
  } | null,
  transformKeyFn?: (key: string) => string
  transformValueFn?: (val: number) => number
  summary: DominanceSummary | MessageDescriptor
  disabled?: {
    value: MessageDescriptor
    summary: MessageDescriptor
  },
  colorSetFn?: () => string[],
  showTotal?: boolean
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
    airtimeBusy: $t({ defaultMessage: 'Avg Airtime Busy' }),
    airtimeRx: $t({ defaultMessage: 'Avg Airtime Rx' }),
    airtimeTx: $t({ defaultMessage: 'Avg Airtime Tx' }),
    airtimeIdle: $t({ defaultMessage: 'Avg Airtime Idle' })
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

export const transformAirtimeCast = (key: string) => {
  const { $t } = getIntl()
  const map = {
    txUnicastFrames: $t({ defaultMessage: 'Unicast Frames' }),
    txBroadcastFrames: $t({ defaultMessage: 'Broadcast Frames' }),
    txMulticastFrames: $t({ defaultMessage: 'Multicast Frames' })
  }
  return _.get(map, key, '')
}

export const transformAirtimeClientsByAP = (key: string) => {
  const { $t } = getIntl()
  const map = {
    small: $t({ defaultMessage: 'Less than 30 clients' }),
    medium: $t({ defaultMessage: '31 to 50 clients' }),
    large: $t({ defaultMessage: 'More than 50 clients' })
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

export const getAirtimeMetricColorSet = () => qualitativeColorSet().filter((_,index) => index !== 3)

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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
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
    },
    showTotal: false
  },
  [NetworkImpactChartTypes.RogueAPByChannel]: {
    title: defineMessage({ defaultMessage: 'Rogue APs' }),
    tooltipFormat: defineMessage({
      defaultMessage: `{name, select,
        Others {Others}
        other {Channel {name}}
      }<br></br>
      <space><b>{formattedValue} {value, plural,
        one {rogue AP}
        other {rogue APs}
      }</b></space>`
    }),
    summary: {
      dominance: defineMessage({
        defaultMessage: `{value} {value, plural,
          one {rogue AP}
          other {rogue APs}
        } in Channel {dominant}`
      }),
      broad: defineMessage({
        defaultMessage: `{total} rogue APs detected in {count} {count, plural,
          one {channel}
          other {channels}
        }`
      })
    },
    disabled: {
      value: defineMessage({ defaultMessage: 'Unknown' }),
      summary: defineMessage({ defaultMessage: 'Enable rogue AP detection' })
    }
  },
  [NetworkImpactChartTypes.RxPhyErrByAP]: {
    title: defineMessage({ defaultMessage: 'Rx PHY Errors' }),
    tooltipFormat: defineMessage({
      defaultMessage: `{name}<br></br>
      <space><b>{formattedValue} {value, plural,
        one {error}
        other {errors}
      }</b></space>`
    }),
    summary: {
      dominance: defineMessage({
        defaultMessage: '{dominant} has the highest Rx PHY errors'
      }),
      broad: defineMessage({
        defaultMessage: `{total} Rx PHY errors observed in {count} {count, plural,
          one {AP}
          other {APs}
        }`
      })
    }
  },
  [NetworkImpactChartTypes.AirtimeBusy]: {
    title: defineMessage({ defaultMessage: 'Average Airtime Busy' }),
    tooltipFormat: tooltipFormats.distribution,
    dataFomatter: formatter('percentFormat'),
    transformKeyFn: transformAirtimeMetricKey,
    summary: defineMessage({ defaultMessage: 'Peak airtime busy was {count}' }),
    colorSetFn: getAirtimeMetricColorSet
  },
  [NetworkImpactChartTypes.AirtimeTx]: {
    title: defineMessage({ defaultMessage: 'Average Airtime Tx' }),
    tooltipFormat: tooltipFormats.distribution,
    dataFomatter: formatter('percentFormat'),
    transformKeyFn: transformAirtimeMetricKey,
    summary: defineMessage({ defaultMessage: 'Peak airtime Tx was {count}' }),
    colorSetFn: getAirtimeMetricColorSet
  },
  [NetworkImpactChartTypes.AirtimeRx]: {
    title: defineMessage({ defaultMessage: 'Average Airtime Rx' }),
    tooltipFormat: tooltipFormats.distribution,
    dataFomatter: formatter('percentFormat'),
    transformKeyFn: transformAirtimeMetricKey,
    summary: defineMessage({ defaultMessage: 'Peak airtime Rx was {count}' }),
    colorSetFn: getAirtimeMetricColorSet
  },
  [NetworkImpactChartTypes.AirtimeMgmtFrame]: {
    title: defineMessage({ defaultMessage: 'Average % of Mgmt. Frames' }),
    tooltipFormat: tooltipFormats.distribution,
    transformKeyFn: transformAirtimeFrame,
    summary: defineMessage({ defaultMessage: 'Peak percentage of mgmt. frames was {count}' })
  },
  [NetworkImpactChartTypes.AirtimeCast]: {
    title: defineMessage({ defaultMessage: 'Average % of MC & BC Frames' }),
    tooltipFormat: tooltipFormats.distribution,
    transformKeyFn: transformAirtimeCast,
    summary: defineMessage({ defaultMessage: 'Peak percentage of MC & BC frames was {count}' })
  },
  [NetworkImpactChartTypes.AirtimeClientsByAP]: {
    title: defineMessage({ defaultMessage: 'Average Peak No. of Clients per AP' }),
    tooltipFormat: tooltipFormats.aps,
    valueFormatter: formatter('countFormatRound'),
    transformKeyFn: transformAirtimeClientsByAP,
    summary: defineMessage({ defaultMessage: 'Peak number of clients per AP was {count}' })
  }
}

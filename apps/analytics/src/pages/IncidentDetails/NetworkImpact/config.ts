import _                                               from 'lodash'
import { defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

import { mapCodeToReason, Incident } from '@acx-ui/analytics/utils'
import { formatter }                 from '@acx-ui/utils'

import { apRebootReasonMap }      from './apRebootReasonMap'
import { NetworkImpactChartData } from './services'

export type NetworkImpactType = 'ap'
| 'client'
| 'apDowntime'
| 'apReboot'
| 'apRebootEvent'
| 'apInfra'

export type NetworkImpactChartConfig = {
  chart: NetworkImpactChartTypes
  type: NetworkImpactType
  dimension: string
}

export interface NetworkImpactChart {
  title: MessageDescriptor
  tooltipFormat: MessageDescriptor
  dominanceFn?: (data: NetworkImpactChartData['data'], incident: Incident) => {
    key: string
    value: number
    percentage: number
  } | null,
  transformKeyFn?: (key: string, intl: IntlShape) => string
  transformValueFn?: (val: number, intl: IntlShape) => number
  summary: {
    dominance: MessageDescriptor,
    broad: MessageDescriptor
  }
}

export const getDataWithPercentage = (data: NetworkImpactChartData['data']) => {
  const sum = _.sumBy(data, 'value')
  return data.map(({ key, value }) => ({ key, value, percentage: !sum ? 0 : value / sum }))
}

export const getDominance = (data: NetworkImpactChartData['data']) =>
  _.maxBy(getDataWithPercentage(data), 'percentage')

export const getAPRebootReason = (key: string, { $t }: IntlShape) => {
  const content = _.get(apRebootReasonMap, key.replace(/cubic/ig, 'cia'))
  return content ? $t(content) : key
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
  }
}

import _                                               from 'lodash'
import { defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

import { mapCodeToReason, Incident } from '@acx-ui/analytics/utils'
import { formatter }                 from '@acx-ui/utils'

import { NetworkImpactChartData } from './services'

export interface NetworkImpactChart {
  key: string
  title: MessageDescriptor
  dimension: string
  type: string
  highlight: MessageDescriptor
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
  },
  order?: number
}

export const getDataWithPercentage = (data: NetworkImpactChartData['data']) => {
  const sum = _.sumBy(data, 'value')
  return data.map(({ key, value }) => ({ key, value, percentage: !sum ? 0 : value / sum }))
}

export const getDominance = (data: NetworkImpactChartData['data']) =>
  _.maxBy(getDataWithPercentage(data), 'percentage')

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

export const networkImpactCharts: Readonly<Record<string, NetworkImpactChart>> = {
  WLAN: {
    key: 'WLAN',
    title: defineMessage({ defaultMessage: 'WLAN' }),
    dimension: 'ssids',
    type: 'client',
    highlight: defineMessage({ defaultMessage: `{name}<br></br><b>{formattedValue} {value, plural,
      one {Client}
      other {Clients}
    }</b>` }),
    dominanceFn: getWLANDominance,
    summary: {
      dominance: defineMessage({
        defaultMessage: '{percentage} of failures impacted {dominant} WLAN' }),
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {WLAN}
          other {WLANs}
        }` })
    },
    order: 0
  },
  radio: {
    key: 'radio',
    title: defineMessage({ defaultMessage: 'Radio' }),
    dimension: 'radios',
    type: 'client',
    transformKeyFn: (val: string) => formatter('radioFormat')(val) as string,
    highlight: defineMessage({ defaultMessage: `{name}<br></br><b>{formattedValue} {value, plural,
      one {Client}
      other {Clients}
    }</b>` }),
    summary: {
      dominance: defineMessage({
        defaultMessage: '{percentage} of failures impacted {dominant} band' }),
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {band}
          other {bands}
        }` })
    },
    order: 5
  },
  reason: {
    key: 'reason',
    title: defineMessage({ defaultMessage: 'Reason' }),
    dimension: 'reasonCodes',
    type: 'client',
    transformKeyFn: mapCodeToReason,
    highlight: defineMessage({ defaultMessage: `{name}<br></br><b>{formattedValue} {value, plural,
      one {Client}
      other {Clients}
    }</b>` }),
    summary: {
      dominance: defineMessage({
        defaultMessage: "{percentage} of failures caused by ''{dominant}''" }),
      broad: defineMessage({
        defaultMessage: `{count} {count, plural,
          one {reason}
          other {reasons}
        } contributed to this incident` })
    },
    order: 1
  },
  clientManufacturer: {
    key: 'clientManufacturer',
    title: defineMessage({ defaultMessage: 'Client Manufacturers' }),
    dimension: 'manufacturer',
    type: 'client',
    highlight: defineMessage({ defaultMessage: `{name}<br></br><b>{formattedValue} {value, plural,
      one {Client}
      other {Clients}
    }</b>` }),
    summary: {
      dominance: defineMessage({
        defaultMessage:
          '{percentage} of failures impacted {dominant} client manufacturer' }),
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {client manufacturer}
          other {client manufacturers}
        }` })
    },
    order: 2
  }
}

import _                                               from 'lodash'
import { defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

import { mapCodeToReason, Incident } from '@acx-ui/analytics/utils'
import { formatter }                 from '@acx-ui/utils'

import { DonutChartData } from './services'

export interface DonutChart {
  key: string
  title: MessageDescriptor
  dimensionAlias?: string
  dimension: string
  type: string
  unit: MessageDescriptor
  dominanceFn?: (data: DonutChartData['data'], incident: Incident) => {
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

export const getDataWithPercentage = (data: DonutChartData['data']) => {
  const sum = _.sumBy(data, 'value')
  return data.map(({ key, value }) => ({ key, value, percentage: !sum ? 0 : value / sum }))
}

export const getDominance = (data: DonutChartData['data']) =>
  _.maxBy(getDataWithPercentage(data), 'percentage')

const dominanceThreshold = 0.7

export const getDominanceByThreshold = (threshold: number = dominanceThreshold) => (
  data: DonutChartData['data']
) => {
  const max = getDominance(data)
  return (max && max.percentage > threshold && max.key !== 'Others') ? max : null
}

export const getWLANDominance = (
  data: DonutChartData['data'], incident: Incident
) => {
  const dominant = incident.metadata.dominant.ssid
  const percentage = getDataWithPercentage(data)
  return _.pickBy(percentage, p => p.key === dominant)[1] || null
}

export const donutCharts: Readonly<Record<string, DonutChart>> = {
  WLAN: {
    key: 'WLAN',
    title: defineMessage({ defaultMessage: 'WLAN' }),
    dimension: 'ssids',
    type: 'client',
    unit: defineMessage({ defaultMessage: `{formattedCount} {count, plural,
      one {Client}
      other {Clients}
    }` }),
    dominanceFn: getWLANDominance,
    summary: {
      dominance: defineMessage({
        defaultMessage: '{percentage} % of failures impacted {transformedKey} WLAN' }),
      broad: defineMessage({
        defaultMessage: 'This incident impacted {count} WLANs' })
    },
    order: 0
  },
  radio: {
    key: 'radio',
    title: defineMessage({ defaultMessage: 'Radio' }),
    dimension: 'radios',
    type: 'client',
    transformKeyFn: (val: string) => formatter('radioFormat')(val) as string,
    unit: defineMessage({ defaultMessage: `{formattedCount} {count, plural,
      one {Client}
      other {Clients}
    }` }),
    summary: {
      dominance: defineMessage({
        defaultMessage: '{percentage} % of failures impacted {transformedKey} band' }),
      broad: defineMessage({
        defaultMessage: 'This incident impacted {count} bands' })
    },
    order: 5
  },
  reason: {
    key: 'reason',
    title: defineMessage({ defaultMessage: 'Reason' }),
    dimension: 'reasonCodes',
    type: 'client',
    transformKeyFn: mapCodeToReason,
    unit: defineMessage({ defaultMessage: `{formattedCount} {count, plural,
      one {Client}
      other {Clients}
    }` }),
    summary: {
      dominance: defineMessage({
        defaultMessage: "{percentage} % of failures caused by ''{transformedKey}''" }),
      broad: defineMessage({
        defaultMessage: '{count} reasons contributed to this incident' })
    },
    order: 1
  },
  clientManufacturer: {
    key: 'clientManufacturer',
    title: defineMessage({ defaultMessage: 'Client Manufacturers' }),
    dimension: 'manufacturer',
    type: 'client',
    unit: defineMessage({ defaultMessage: `{formattedCount} {count, plural,
      one {Client}
      other {Clients}
    }` }),
    summary: {
      dominance: defineMessage({
        defaultMessage:
          '{percentage} % of failures impacted {transformedKey} client manufacturer' }),
      broad: defineMessage({
        defaultMessage: 'This incident impacted {count} client manufacturers' })
    },
    order: 2
  }
}
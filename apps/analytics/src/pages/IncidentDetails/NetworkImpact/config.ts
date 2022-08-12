import _ from 'lodash'

import { mapCodeToReason, Incident } from '@acx-ui/analytics/utils'
import { formatter }                 from '@acx-ui/utils'

import { DonutChartData } from './services'

export interface DonutChart {
  title: string
  dimensionAlias?: string
  dimension: string
  type: string
  unit: string
  dominanceFn?: (data: DonutChartData['data'], incident: Incident) => {
    key: string
    value: number
    percentage: number
  } | null,
  transformKeyFn?: (key: string) => string
  transformValueFn?: (val: number) => number
  summary: {
    dominance: string,
    broad: string
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

export const getDominanceByThreshold = (threshold: number) => (
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

const enhanceDonutChart = (donutCharts: Record<string,DonutChart>) => Object.keys(donutCharts)
  .reduce((acc, key) => {
    const entry = donutCharts[key as keyof typeof donutCharts]
    return {
      ...acc,
      [key]: {
        ...entry,
        dominanceFn: entry.dominanceFn || getDominanceByThreshold(dominanceThreshold),
        transformKeyFn: entry.transformKeyFn || _.identity,
        transformValueFn: entry.transformValueFn || _.identity
      } as DonutChart
    }
  }, {} as Record<keyof typeof donutCharts, DonutChart>)

export const donutCharts: Readonly<Record<string, DonutChart>> = enhanceDonutChart({
  WLAN: {
    title: 'WLAN',
    dimension: 'ssids',
    type: 'client',
    unit: 'Client',
    dominanceFn: getWLANDominance,
    summary: {
      dominance: '{percentage} % of failures impacted {key} WLAN',
      broad: 'This incident impacted {count} WLANs'
    },
    order: 0
  },
  radio: {
    title: 'Radio',
    dimension: 'radios',
    type: 'client',
    transformKeyFn: (val: string) => formatter('radioFormat')(val) as string,
    unit: 'Client',
    summary: {
      dominance: '{percentage} % of failures impacted {transformedKey} band',
      broad: 'This incident impacted {count} bands'
    },
    order: 5
  },
  reason: {
    title: 'Reason',
    dimension: 'reasonCodes',
    type: 'client',
    transformKeyFn: mapCodeToReason,
    unit: 'Client',
    summary: {
      dominance: "{percentage} % of failures caused by ''{transformedKey}''",
      broad: '{count} reasons contributed to this incident'
    },
    order: 1
  },
  clientManufacturer: {
    title: 'Client Manufacturers',
    dimension: 'manufacturer',
    type: 'client',
    unit: 'Client',
    summary: {
      dominance: '{percentage} % of failures impacted {key} client manufacturer',
      broad: 'This incident impacted {count} client manufacturers'
    },
    order: 2
  }
})

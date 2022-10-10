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

const highlights = {
  clients: defineMessage({
    defaultMessage: `{name}<br></br>
    <space><b>{formattedValue} {value, plural,
      one {client}
      other {clients}
    }</b></space>`
  })
}

export enum NetworkImpactChartTypes {
  WLAN,
  Radio,
  Reason,
  ClientManufacturer,
  APModel,
  APVersion,
  OS
}

export const networkImpactCharts = {
  [NetworkImpactChartTypes.WLAN]: {
    key: 'WLAN',
    title: defineMessage({ defaultMessage: 'WLAN' }),
    dimension: 'ssids',
    type: 'client',
    highlight: highlights.clients,
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
  [NetworkImpactChartTypes.Radio]: {
    key: 'radio',
    title: defineMessage({ defaultMessage: 'Radio' }),
    dimension: 'radios',
    type: 'client',
    transformKeyFn: (val: string) => formatter('radioFormat')(val) as string,
    highlight: highlights.clients,
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
  [NetworkImpactChartTypes.Reason]: {
    key: 'reason',
    title: defineMessage({ defaultMessage: 'Reason' }),
    dimension: 'reasonCodes',
    type: 'client',
    transformKeyFn: mapCodeToReason,
    highlight: highlights.clients,
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
  [NetworkImpactChartTypes.ClientManufacturer]: {
    key: 'clientManufacturer',
    title: defineMessage({ defaultMessage: 'Client Manufacturers' }),
    dimension: 'manufacturer',
    type: 'client',
    highlight: highlights.clients,
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
  },
  [NetworkImpactChartTypes.APModel]: {
    key: 'apModel',
    title: defineMessage({ defaultMessage: 'AP Model' }),
    dimension: 'apModels',
    type: 'client',
    highlight: highlights.clients,
    summary: {
      dominance: defineMessage({
        defaultMessage:
          '{percentage} of failures impacted {dominant} AP model' }),
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {AP model}
          other {AP models}
        }`
      })
    },
    order: 3
  },
  [NetworkImpactChartTypes.APVersion]: {
    key: 'apVersion',
    title: defineMessage({ defaultMessage: 'AP Version' }),
    dimension: 'apFwVersions',
    type: 'client',
    highlight: highlights.clients,
    summary: {
      dominance: defineMessage({
        defaultMessage:
          '{percentage} of failures impacted {dominant} AP firmware' }),
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {AP firmware}
          other {AP firmwares}
        }`
      })
    },
    order: 4
  },
  [NetworkImpactChartTypes.OS]: {
    key: 'os',
    title: defineMessage({ defaultMessage: 'OS' }),
    dimension: 'osType',
    type: 'client',
    highlight: highlights.clients,
    summary: {
      dominance: defineMessage({
        defaultMessage:
          '{percentage} of failures impacted {dominant} operating system' }),
      broad: defineMessage({
        defaultMessage: `This incident impacted {count} {count, plural,
          one {operating system}
          other {operating systems}
        }`
      })
    },
    order: 2
  }
} as Readonly<Record<NetworkImpactChartTypes, NetworkImpactChart>>

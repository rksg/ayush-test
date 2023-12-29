import { groupBy, mean } from 'lodash'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'
import {
  MspEc
} from '@acx-ui/msp/utils'
import {
  TableResult

} from '@acx-ui/rc/utils'

import type { Response, BrandVenuesSLA } from './services'
import type { SliceType }                from './useSliceType'
export type ChartKey = 'incident' | 'experience' | 'compliance'

type SLARecord = [ number, number ]
export interface Common {
  lsp: string
  p1Incidents: number
  guestExp: number
  ssidCompliance: number
  deviceCount: number
  avgConnSuccess: number,
  avgTTC: number,
  avgClientThroughput: number
}
export interface Property extends Common {
  property: string
}
export interface Lsp extends Common {
  propertyCount: number
}

interface TransformedItem {
  name: string
  type: string
  content: object[]
  integrator?:string
}

interface TransformedMap {
  [key: string]: TransformedItem;
}

const calcSLA = (sla: SLARecord) => (sla[1] !== 0 ? sla[0] / sla[1] : 0)

const calGuestExp = (cS: number, ttc: number, cT: number) =>
  mean([cS, ttc, cT])
export const transformToLspView = (properties: Response[]): Lsp[] => {
  const lsps = groupBy(properties, (p) => p.lsp)
  return Object.entries(lsps).map(([lsp, properties]) => {
    const {
      connSuccess,
      ttc,
      clientThroughput,
      p1Incidents,
      ssidCompliance,
      deviceCount
    } = properties.reduce(
      (acc, cur) => ({
        connSuccess: [
          acc.connSuccess[0] + cur.avgConnSuccess[0],
          acc.connSuccess[1] + cur.avgConnSuccess[1]
        ],
        ttc: [acc.ttc[0] + cur.avgTTC[0], acc.ttc[1] + cur.avgTTC[1]],
        clientThroughput: [
          acc.clientThroughput[0] + cur.avgClientThroughput[0],
          acc.clientThroughput[1] + cur.avgClientThroughput[1]
        ],
        p1Incidents: acc.p1Incidents + cur.p1Incidents,
        ssidCompliance: [
          acc.ssidCompliance[0] + cur.ssidCompliance[0],
          acc.ssidCompliance[1] + cur.ssidCompliance[1]
        ],
        deviceCount: acc.deviceCount + cur.deviceCount
      }),
      {
        connSuccess: [0, 0],
        ttc: [0, 0],
        clientThroughput: [0, 0],
        p1Incidents: 0,
        ssidCompliance: [0, 0],
        deviceCount: 0
      }
    )
    const avgConnSuccess = calcSLA(connSuccess as SLARecord)
    const avgTTC = calcSLA(ttc as SLARecord)
    const avgClientThroughput = calcSLA(clientThroughput as SLARecord)
    return {
      lsp,
      propertyCount: properties.length,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput,
      p1Incidents,
      ssidCompliance: calcSLA(ssidCompliance as SLARecord),
      deviceCount,
      guestExp: calGuestExp(avgConnSuccess, avgTTC, avgClientThroughput)
    }
  })
}
export const transformToPropertyView = (data: Response[]): Property[] =>
  data.map((property: Response) => {
    const avgConnSuccess = calcSLA(property.avgConnSuccess),
      avgClientThroughput = calcSLA(property.avgClientThroughput),
      avgTTC = calcSLA(property.avgTTC),
      ssidCompliance = calcSLA(property.ssidCompliance)
    return {
      ...property,
      ssidCompliance,
      avgConnSuccess,
      avgClientThroughput,
      avgTTC,
      guestExp: calGuestExp(avgConnSuccess, avgClientThroughput, avgTTC)
    } as Property
  })

export function computePastRange (
  startDate: string, endDate: string
): [string, string] {
  return [
    moment(startDate).subtract(moment(endDate).diff(startDate)).format(),
    startDate
  ]
}

export const slaKpiConfig = {
  incident: {
    getTitle: (sliceType: SliceType) => sliceType === 'lsp'
      ? defineMessage({ defaultMessage: 'Distressed LSPs' })
      : defineMessage({ defaultMessage: 'Distressed Properties' }),
    dataKey: 'p1Incidents',
    avg: false,
    formatter: formatter('countFormat'),
    direction: 'low'
  },
  experience: {
    getTitle: () => defineMessage({ defaultMessage: 'Guest Experience' }),
    dataKey: 'guestExp',
    avg: true,
    formatter: formatter('percentFormat'),
    direction: 'high'
  },
  compliance: {
    getTitle: () => defineMessage({ defaultMessage: 'Brand SSID Compliance' }),
    dataKey: 'ssidCompliance',
    avg: true,
    formatter: formatter('percentFormat'),
    direction: 'high'
  }
}

export const transformLookupAndMappingData = (mappingData : TableResult<MspEc>) => {
  const groupedById= groupBy(mappingData?.data, 'id')
  return Object.keys(groupedById).reduce((newObj, key) => {
    newObj[key] = {
      name: groupedById[key][0].name,
      type: groupedById[key][0].tenantType,
      ...(groupedById[key][0].integrator ? { integrator: groupedById[key][0]?.integrator } : {}),
      content: groupedById[key]
    }
    return newObj
  }, {} as TransformedMap)

}

export const transformVenuesData = (
  venuesData: { data: BrandVenuesSLA[] },
  lookupAndMappingData: TransformedMap
): Response[] => {
  const groupByTenantID = groupBy(venuesData?.data, 'tenantId')
  const sumSLAData = (data: ([number | null, number | null] | null)[], initial: number[]) =>
    data.reduce((total, current) => {
      const values = current || [0, 0]
      return total.map((num, index) => num + (values[index] || 0)) as [number, number]
    }, initial)
  return Object.keys(groupByTenantID).reduce((newObj, tenantId) => {
    const mappingData = lookupAndMappingData[tenantId]
    if (mappingData?.integrator) {
      const tenantData = groupByTenantID[tenantId]
      newObj.push({
        property: mappingData?.name,
        lsp: lookupAndMappingData[mappingData.integrator]?.name,
        p1Incidents: tenantData.reduce((total, venue) => total + (venue.incidentCount || 0), 0),
        ssidCompliance: sumSLAData(
          tenantData.map(v => v.ssidComplianceSLA), [0, 0]
        ) as [number, number],
        deviceCount: (sumSLAData(
          tenantData.map(v => v.onlineApsSLA), [0, 0]
        ) as [number, number])?.[1],
        avgConnSuccess: sumSLAData(
          tenantData.map(v => v.connectionSuccessSLA), [0, 0]
        ) as [number, number],
        avgTTC: sumSLAData(tenantData.map(v => v.timeToConnectSLA), [0, 0]) as [number, number],
        avgClientThroughput: sumSLAData(
          tenantData.map(v => v.clientThroughputSLA), [0, 0]
        ) as [number, number]
      })
    }
    return newObj
  }, [] as Response[])
}
import { groupBy, mean } from 'lodash'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { formatter }     from '@acx-ui/formatter'
import { MspEc }         from '@acx-ui/msp/utils'
import { TableResult }   from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import type { Response, BrandVenuesSLA } from './services'
import type { SliceType }                from './useSliceType'
export type ChartKey = 'incident' | 'experience' | 'compliance'

type SLARecord = [ number, number ]
type SortResult = -1 | 0 | 1

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

export interface TransformedMap {
  [key: string]: TransformedItem;
}

export const calcSLA = (sla: SLARecord) => (sla[1] !== 0 ? sla[0] / sla[1] : 0)
export const checkNaN = (val: number) => (!isNaN(val) ? val : 0)
function checkPropertiesForNaN (
  properties : Response[],
  valueType: 'avgConnSuccess' | 'avgTTC' | 'avgClientThroughput' | 'ssidCompliance',
  calculatedValue: number[]
) {
  return properties.some(property =>
    !isNaN(property[valueType]?.[0]) && !isNaN(property[valueType]?.[1]))
    ? calcSLA(calculatedValue as SLARecord)
    : NaN
}

const calGuestExp = (cS: number, ttc: number, cT: number) => mean([cS, ttc, cT])
export const transformToLspView = (properties: Response[]): Lsp[] => {
  const lsps = groupBy(properties, (p) => p.lsp)
  return Object.entries(lsps).map(([lsp, properties], ind) => {
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
          acc.connSuccess[0] + checkNaN(cur.avgConnSuccess[0]),
          acc.connSuccess[1] + checkNaN(cur.avgConnSuccess[1])
        ],
        ttc: [acc.ttc[0] + checkNaN(cur.avgTTC[0]),
          acc.ttc[1] + checkNaN(cur.avgTTC[1])],
        clientThroughput: [
          acc.clientThroughput[0] + checkNaN(cur.avgClientThroughput[0]),
          acc.clientThroughput[1] + checkNaN(cur.avgClientThroughput[1])
        ],
        p1Incidents: acc.p1Incidents + cur.p1Incidents,
        ssidCompliance: [
          acc.ssidCompliance[0] + checkNaN(cur.ssidCompliance[0]),
          acc.ssidCompliance[1] + checkNaN(cur.ssidCompliance[1])
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
    const avgConnSuccess = checkPropertiesForNaN(properties, 'avgConnSuccess', connSuccess)
    const avgTTC = checkPropertiesForNaN(properties, 'avgTTC', ttc)
    const avgClientThroughput = checkPropertiesForNaN(
      properties,
      'avgClientThroughput',
      clientThroughput
    )
    const validatedSsidCompliance = checkPropertiesForNaN(
      properties,
      'ssidCompliance',
      ssidCompliance
    )
    return {
      id: `${lsp}-${ind}`,
      lsp,
      propertyCount: properties.length,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput,
      p1Incidents,
      ssidCompliance: validatedSsidCompliance,
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
    direction: 'low',
    order: 'asc'
  },
  experience: {
    getTitle: () => defineMessage({ defaultMessage: 'Guest Experience' }),
    dataKey: 'guestExp',
    avg: true,
    formatter: formatter('percentFormat'),
    direction: 'high',
    order: 'desc'
  },
  compliance: {
    getTitle: () => defineMessage({ defaultMessage: 'Brand SSID Compliance' }),
    dataKey: 'ssidCompliance',
    avg: true,
    formatter: formatter('percentFormat'),
    direction: 'high',
    order: 'desc'
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

  const sumData = (data: ([number | null, number | null] | null)[], initial: number[]) =>
    data
      ? data?.reduce((total, current) => {
        const values = current as [number, number]
        return total.map((num, index) => num + (values[index] || 0)) as [number, number]
      }, initial)
      : noDataDisplay
  return Object.keys(lookupAndMappingData).reduce((newObj, tenantId, ind) => {
    const mappingData = lookupAndMappingData[tenantId]
    if (mappingData?.integrator) {
      const tenantData = groupByTenantID[tenantId]
      newObj.push({
        id: `${mappingData?.name}-${lookupAndMappingData[mappingData.integrator]?.name}-${ind}`,
        property: mappingData?.name,
        lsp: lookupAndMappingData[mappingData.integrator]?.name,
        p1Incidents: tenantData
          ? tenantData?.reduce((total, venue) => total + (venue.incidentCount || 0), 0) : 0,
        ssidCompliance: sumData(
          tenantData?.map(v => v.ssidComplianceSLA), [0, 0]
        ) as [number, number],
        deviceCount: tenantData
          ? tenantData?.reduce((total, venue) => total + (venue.onlineApsSLA?.[1] || 0), 0) : 0,
        avgConnSuccess: sumData(
          tenantData?.map(v => v.connectionSuccessSLA), [0, 0]
        ) as [number, number],
        avgTTC: sumData(tenantData?.map(v => v.timeToConnectSLA), [0, 0]) as [number, number],
        avgClientThroughput: sumData(
          tenantData?.map(v => v.clientThroughputSLA), [0, 0]
        ) as [number, number]
      })
    }
    return newObj
  }, [] as Response[])
}

export function customSort (a: unknown, b: unknown): SortResult {
  if (isNaN(a as number)) return -1
  if (isNaN(b as number)) return 1
  return Number(a) - Number(b) as SortResult
}

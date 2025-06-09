import { groupBy }       from 'lodash'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { formatter }              from '@acx-ui/formatter'
import { MspEc }                  from '@acx-ui/msp/utils'
import { TableResult }            from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import type { Response, BrandVenuesSLA } from './services'
export type ChartKey = 'incident' | 'experience' | 'compliance' | 'mdu'

type SLARecord = [ number, number ]
type SortResult = -1 | 0 | 1

export interface Common {
  lsp: string
  p1Incidents: number
  guestExp: number | null
  ssidCompliance: number | null
  deviceCount: number
  avgConnSuccess: number | null,
  avgTTC: number | null,
  avgClientThroughput: number | null,
  prospectCountSLA: number
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
  integrators?: string[]
}

export interface TransformedMap {
  [key: string]: TransformedItem;
}

export const calcSLA = (sla: SLARecord) => (sla[1] !== 0 ? sla[0] / sla[1] : null)
export const noDataCheck = (val:number | null) => val === 0 || val === null ? true : false
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

const calGuestExp = (cS: number | null, ttc: number | null, cT: number | null) => {
  const validValues = [cS, ttc, cT].filter((value) => value !== null)
  if (validValues.length > 0) {
    const sum = validValues?.reduce((acc, value) =>(acc as number) + (value as number), 0)
    return (sum as number) / validValues.length
  } else {
    return null
  }
}
export const transformToLspView = (properties: Response[], lspLabel: string): Lsp[] => {
  const { $t } = getIntl()
  const lsps = properties.reduce((lspMap, p) => {
    p.lsps.forEach(lsp => {
      if (lspMap[lsp]) {
        lspMap[lsp as keyof typeof lspMap] = [...lspMap[lsp as keyof typeof lspMap], p]
      } else {
        lspMap[lsp as keyof typeof lspMap] = [p]
      }
    })

    return lspMap
  }, {} as { [key: string]: Response[] })

  return Object.entries(lsps).map(([lsp, properties], ind) => {
    const {
      connSuccess,
      ttc,
      clientThroughput,
      p1Incidents,
      ssidCompliance,
      deviceCount,
      prospectCountSLA
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
        deviceCount: acc.deviceCount + cur.deviceCount,
        prospectCountSLA: acc.prospectCountSLA + cur.prospectCountSLA
      }),
      {
        connSuccess: [0, 0],
        ttc: [0, 0],
        clientThroughput: [0, 0],
        p1Incidents: 0,
        ssidCompliance: [0, 0],
        deviceCount: 0,
        prospectCountSLA: 0
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
      lsp: lsp === '-' ? $t({ defaultMessage: 'No {lspLabel}' }, { lspLabel }) : lsp,
      propertyCount: properties.length,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput,
      p1Incidents,
      ssidCompliance: validatedSsidCompliance,
      deviceCount,
      guestExp: calGuestExp(avgConnSuccess, avgTTC, avgClientThroughput),
      prospectCountSLA
    }
  })
}
export const transformToPropertyView = (data: Response[]): Property[] =>
  data.map((property: Response) => {
    const avgConnSuccess = !noDataCheck(property.avgConnSuccess[1])
        ? calcSLA(property.avgConnSuccess)
        : null,
      avgClientThroughput = !noDataCheck(property.avgClientThroughput[1])
        ? calcSLA(property.avgClientThroughput)
        : null,
      avgTTC = !noDataCheck(property.avgTTC[1])
        ? calcSLA(property.avgTTC)
        : null,
      ssidCompliance = !noDataCheck(property?.ssidCompliance[1])
        ? calcSLA(property.ssidCompliance)
        : null
    return {
      ...property,
      ssidCompliance,
      avgConnSuccess,
      avgClientThroughput,
      avgTTC,
      guestExp: calGuestExp(avgConnSuccess, avgClientThroughput, avgTTC),
      lsp: property.lsps.join(', ')
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
    getTitle: () => defineMessage({ defaultMessage: '{name} Health' }),
    dataKey: 'p1Incidents',
    avg: false,
    formatter: formatter('countFormat'),
    direction: 'low',
    order: 'asc'
  },
  experience: {
    getTitle: (isMDU: boolean) => isMDU // istanbul ignore next
      ? defineMessage({ defaultMessage: 'Resident Experience' })
      : defineMessage({ defaultMessage: 'Guest Experience' }),
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
  },
  mdu: {
    getTitle: // istanbul ignore next
      () => defineMessage({ defaultMessage: '# of Prospects' }),
    dataKey: 'prospectCountSLA',
    avg: true,
    formatter: formatter('countFormat'),
    direction: 'high',
    order: 'desc'
  }
}

export type ECList = TableResult<MspEc & { integrators?: string[] }>

export const transformLookupAndMappingData = (mappingData : ECList) => {
  const groupedById= groupBy(mappingData?.data, 'id')
  return Object.keys(groupedById).reduce((newObj, key) => {
    newObj[key] = {
      name: groupedById[key][0].name,
      type: groupedById[key][0].tenantType,
      integrators: groupedById[key][0].integrator
        ? [groupedById[key][0]?.integrator as string]
        : (groupedById[key][0].integrators ? groupedById[key][0]?.integrators : []),
      content: groupedById[key]
    }
    return newObj
  }, {} as TransformedMap)
}

export const transformVenuesData = (
  venuesData: { data: BrandVenuesSLA[] },
  lookupAndMappingData: TransformedMap,
  isMDU: boolean
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
    const tenantData = groupByTenantID[tenantId]
    mappingData.type === 'MSP_REC' && newObj.push({
      id: `${mappingData?.name}-${ind}`,
      property: mappingData?.name,
      lsps: mappingData?.integrators?.length
        ? mappingData?.integrators?.map(integrator => lookupAndMappingData[integrator]?.name)
        : ['-'],
      p1Incidents: tenantData
        ? tenantData?.reduce((total, venue) => total + (venue.incidentCount || 0), 0) : 0,
      ssidCompliance: isMDU
        ? [0, 0]
        : sumData(
          tenantData?.map(v => v.ssidComplianceSLA), [0, 0]
        ) as [number, number],
      prospectCountSLA: isMDU
        ? tenantData
          ? tenantData?.reduce((total, venue) => total + (venue.prospectCountSLA || 0), 0) : 0
        : 0,
      deviceCount: tenantData
        ? tenantData?.reduce((total, venue) => total +
        (venue.onlineApsSLA?.[1] || 0) + (venue.onlineSwitchesSLA?.[1] || 0), 0) : 0,
      avgConnSuccess: sumData(
        tenantData?.map(v => v.connectionSuccessSLA), [0, 0]
      ) as [number, number],
      avgTTC: sumData(tenantData?.map(v => v.timeToConnectSLA), [0, 0]) as [number, number],
      avgClientThroughput: sumData(
        tenantData?.map(v => v.clientThroughputSLA), [0, 0]
      ) as [number, number],
      tenantId
    })
    return newObj
  }, [] as Response[])
}

export function customSort (a: unknown, b: unknown): SortResult {
  if (isNaN(a as number)) return -1
  if (isNaN(b as number)) return 1
  return Number(a) - Number(b) as SortResult
}

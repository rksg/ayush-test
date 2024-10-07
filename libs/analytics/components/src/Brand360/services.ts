import { gql } from 'graphql-request'

import { IncidentsToggleFilter, calculateGranularity, incidentsToggle }   from '@acx-ui/analytics/utils'
import { dataApi }                                                        from '@acx-ui/store'
import { generateDomainFilter, emptyFilter, FilterNameNode, NodesFilter } from '@acx-ui/utils'

export const calcGranularityForBrand360 = (
  start: string, end: string
): string => calculateGranularity(start, end, undefined, [
  { granularity: 'PT72H', hours: 24 * 30 }, // > 1 month
  { granularity: 'PT24H', hours: 24 * 7 }, // 8 days to 30 days
  { granularity: 'PT1H', hours: 8 }, // 8 hours to 7 days
  { granularity: 'PT15M', hours: 0 } // less than 8 hours
])

const getDomainFilters = (tenantIds: string[]) => {
  if (tenantIds.length === 0) {
    return emptyFilter
  } else {
    return tenantIds.reduce((acc, id) => {
      const domainNode: [FilterNameNode] = generateDomainFilter(id)
      acc.networkNodes?.push(domainNode)
      acc.switchNodes?.push(domainNode)
      return acc
    }, { networkNodes: [], switchNodes: [] } as NodesFilter)
  }
}

export interface Response {
  id?: string
  lsps: string[]
  p1Incidents: number
  ssidCompliance: [number, number]
  deviceCount: number
  avgConnSuccess: [number, number]
  avgTTC: [number, number]
  avgClientThroughput: [number, number]
  property: string,
  tenantId: string
}
export interface BrandTimeseriesPayload {
  start: string,
  end: string,
  ssidRegex: string,
  granularity?: 'all',
  tenantIds: (string | undefined)[]
}
export interface FranchisorTimeseries {
  time: string[],
  incidentCount: number[],
  timeToConnectSLA: number[],
  clientThroughputSLA: number[],
  connectionSuccessSLA: number[],
  ssidComplianceSLA: number[],
  errors: Array<{ sla: string, error: string }>
}
export interface BrandVenuesSLA {
  tenantId: string
  zoneName: string
  incidentCount: number | null
  onlineApsSLA: [number| null, number| null]
  onlineSwitchesSLA: [number| null, number| null]
  ssidComplianceSLA: [number| null, number| null]
  timeToConnectSLA: [number| null, number| null]
  clientThroughputSLA: [number| null, number| null]
  connectionSuccessSLA: [number| null, number| null]
}
const getRequestPayload = (payload: BrandTimeseriesPayload & IncidentsToggleFilter) => {
  const {
    start,
    end,
    ssidRegex,
    tenantIds,
    granularity
  } = payload
  return {
    start,
    end,
    ssidRegex,
    granularity: granularity || calcGranularityForBrand360(start, end),
    severity: { gt: 0.9, lte: 1 },
    code: incidentsToggle(payload),
    filter: getDomainFilters(tenantIds as string[])
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchBrandTimeseries: build.query({
      query: ({ granularity, ...payload }: BrandTimeseriesPayload & IncidentsToggleFilter) => ({
        document: gql`
        query FranchisorTimeseries(
          $start: DateTime,
          $end: DateTime,
          $ssidRegex: String,
          $granularity: String,
          $severity:[Range],
          $code: [String],
          $filter: FilterInput) {
          franchisorTimeseries(
            start: $start,
            end: $end,
            ssidRegex: $ssidRegex,
            granularity: $granularity,
            severity: $severity,
            code: $code,
            filter: $filter) {
              time
              incidentCount
              timeToConnectSLA
              clientThroughputSLA
              connectionSuccessSLA
              ssidComplianceSLA
              prospectCountSLA
            }
          }
        `,
        variables: getRequestPayload({ granularity, ...payload })
      }),
      transformResponse: (res: { franchisorTimeseries: FranchisorTimeseries }) => res
        .franchisorTimeseries
    }),
    fetchBrandProperties: build.query({
      query: (
        { granularity, ...payload }: Omit<BrandTimeseriesPayload, 'tenantIds'>
        & IncidentsToggleFilter
      ) => ({
        document: gql`
        query FranchisorZones(
          $start: DateTime,
          $end: DateTime,
          $ssidRegex: String,
          $severity: [Range],
          $code: [String]) {
          franchisorZones(
            start: $start
            end: $end
            ssidRegex: $ssidRegex
            severity: $severity
            code: $code
          ) {
            tenantId
            zoneName
            incidentCount
            ssidComplianceSLA
            timeToConnectSLA
            clientThroughputSLA
            connectionSuccessSLA
            onlineApsSLA
            onlineSwitchesSLA
          }
        }
        `,
        variables: {
          ...payload,
          severity: { gt: 0.9, lte: 1 },
          code: incidentsToggle(payload)
        }
      }),
      transformResponse: (res: { franchisorZones: BrandVenuesSLA[] }) => res.franchisorZones
    })
  })
})

export const {
  useFetchBrandTimeseriesQuery,
  useFetchBrandPropertiesQuery
} = api


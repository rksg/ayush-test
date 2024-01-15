import { gql } from 'graphql-request'

import { IncidentsToggleFilter, calculateGranularity, incidentsToggle } from '@acx-ui/analytics/utils'
import { dataApi }                                                      from '@acx-ui/store'

export interface Response {
  id?: string
  lsp: string
  p1Incidents: number
  ssidCompliance: [number, number]
  deviceCount: number
  avgConnSuccess: [number, number]
  avgTTC: [number, number]
  avgClientThroughput: [number, number]
  property: string
}
export interface BrandTimeseriesPayload {
  start: string,
  end: string,
  ssidRegex: string,
  granularity?: 'all'
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
  ssidComplianceSLA: [number| null, number| null]
  timeToConnectSLA: [number| null, number| null]
  clientThroughputSLA: [number| null, number| null]
  connectionSuccessSLA: [number| null, number| null]
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
          $code: [String]) {
          franchisorTimeseries(
            start: $start,
            end: $end,
            ssidRegex: $ssidRegex,
            granularity: $granularity,
            severity: $severity,
            code: $code) {
              time
              incidentCount
              timeToConnectSLA
              clientThroughputSLA
              connectionSuccessSLA
              ssidComplianceSLA
            }
          }
        `,
        variables: {
          ...payload,
          granularity: granularity || calculateGranularity(payload.start, payload.end),
          severity: { gt: 0.9, lte: 1 },
          code: incidentsToggle(payload)
        }
      }),
      transformResponse: (res: { franchisorTimeseries: FranchisorTimeseries }) => res
        .franchisorTimeseries
    }),
    fetchBrandProperties: build.query({
      query: ({ granularity, ...payload }: BrandTimeseriesPayload & IncidentsToggleFilter) => ({
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


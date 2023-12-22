import { gql } from 'graphql-request'

import { calculateGranularity, incidentCodes } from '@acx-ui/analytics/utils'
import { dataApi }       from '@acx-ui/store'

import { fetchBrandProperties } from './__tests__/fixtures'

export interface Response {
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

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchBrandProperties: build.query({
      queryFn: () => {
        return {
          data: fetchBrandProperties() as Response[]
        }
      }
    }),
    fetchBrandTimeseries: build.query({
      query: ({ granularity, ...payload }: BrandTimeseriesPayload) => ({
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
          code: incidentCodes
        }
      }),
      transformResponse: (res: { franchisorTimeseries: FranchisorTimeseries }) => res
        .franchisorTimeseries
    })
  })
})

export const {
  useFetchBrandPropertiesQuery,
  useFetchBrandTimeseriesQuery
} = api


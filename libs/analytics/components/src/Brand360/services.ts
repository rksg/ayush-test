import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { incidentCodes } from '@acx-ui/analytics/utils'
import { dataApi }       from '@acx-ui/store'

import { fetchBrandProperties } from './__tests__/fixtures'

import { ChartKey } from '.'



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
  chartKey: ChartKey
  start: string,
  end: string,
  ssidRegex: string,
}
export interface FranchisorTimeseries {
  time: string[],
  incidentCount?: number[],
  timeToConnectSLA?: number[],
  clientThroughputSLA?: number[],
  connectionSuccessSLA?: number[],
  ssidComplianceSLA?: number[],
  errors?: Array<{ sla: string, error: string }>
}

const getSlaFields = (chartKey: ChartKey) => {
  switch (chartKey) {
    case 'incident': return 'incidentCount'
    case 'compliance': return 'ssidComplianceSLA'
    case 'experience': return `
      timeToConnectSLA
      clientThroughputSLA
      connectionSuccessSLA
    `
  }
}

const calculateSlaGranularity = (start: string, end: string) => {
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  switch (true) {
    case interval >= (24 * 30):
      return 'P1D'
    case interval >= (24 * 7):
      return 'PT6H'
    default: return 'PT1H'
  }
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
      query: ({ chartKey, ...payload }: BrandTimeseriesPayload) => ({
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
              ${getSlaFields(chartKey)}
              errors {
                sla
                error
              }
            }
          }
        `,
        variables: {
          ...payload,
          granularity: calculateSlaGranularity(payload.start, payload.end),
          ...(chartKey === 'incident'
            ? {
              severity: { gt: 0.9, lte: 1 },
              code: incidentCodes
            }
            : {})
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


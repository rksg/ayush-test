import { gql } from 'graphql-request'

import { calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'

export interface TimeseriesPayload {
  start: string,
  end: string
}

interface ClientExperienceTimeseriesResponse {
  franchisorTimeseries: FranchisorTimeseries
}

export interface FranchisorTimeseries {
  time: string[],
  timeToConnectSLA: number[],
  clientThroughputSLA: number[],
  connectionSuccessSLA: number[],
  errors: Array<{ sla: string, error: string }>
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    clientExperienceTimeseries: build.query({
      query: ({ start, end }: TimeseriesPayload) => ({
        document: gql`
        query FranchisorTimeseries(
          $start: DateTime,
          $end: DateTime,
          $granularity: String,
          $severity:[Range]
        ) {
          franchisorTimeseries(
            start: $start,
            end: $end,
            granularity: $granularity,
            severity: $severity
          ) {
              time
              timeToConnectSLA
              clientThroughputSLA
              connectionSuccessSLA
            }
          }
        `,
        variables: {
          start,
          end,
          granularity: calculateGranularity(start, end)
        }
      }),
      transformResponse: (response: ClientExperienceTimeseriesResponse) =>
        response.franchisorTimeseries
    })
  })
})

export const { useClientExperienceTimeseriesQuery } = api


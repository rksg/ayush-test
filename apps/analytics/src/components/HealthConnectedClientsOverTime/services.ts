import { gql } from 'graphql-request'

import { dataApi }                         from '@acx-ui/analytics/services'
import { AnalyticsFilter, TimeSeriesData } from '@acx-ui/analytics/utils'

import { calcGranularity } from '../../utils'


export interface HealthTimeseriesData extends TimeSeriesData {
  connectedClientCount: number[],
  newClientCount: number[],
  time: string[]
}

export interface Response <HealthTimeseriesData> {
  network: {
    hierarchyNode: {
      timeSeries: HealthTimeseriesData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    healthTimeseries: build.query<
      HealthTimeseriesData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query HealthTimeSeriesChart(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path:$path) {
                timeSeries(granularity:$granularity) {
                  time
                  newClientCount: connectionAttemptCount
                  connectedClientCount
                }
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          path: payload.path,
          granularity: calcGranularity(payload.startDate, payload.endDate)          
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'HEALTH_CLIENTS' }],
      transformResponse: (data: Response<HealthTimeseriesData>) => 
        data.network.hierarchyNode.timeSeries
    })
  })
})

export const { useHealthTimeseriesQuery } = api

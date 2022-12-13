import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type TrafficByUsageData = {
  time: string[]
  userRxTraffic: number[]
  userTraffic: number[]
  userTxTraffic: number[]
}

interface Response <TimeSeriesData> {
  client: {
    timeSeries: TimeSeriesData
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficByUsage: build.query<
      TrafficByUsageData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query ClientTrafficByUsage($mac: String, $start: DateTime, $end: DateTime, $granularity: String) {
            client(mac: $mac, start: $start, end: $end) {
              timeSeries(granularity: $granularity) {
                time
                userTraffic
                userRxTraffic: userTraffic(direction: "rx")
                userTxTraffic: userTraffic(direction: "tx")
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          mac: payload.mac,
          granularity: 'P1D',
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<TrafficByUsageData>) => {
        return response.client.timeSeries
      }
    })
  })
})

export const { useTrafficByUsageQuery } = api

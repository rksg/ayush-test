/* eslint-disable max-len */
import { gql } from 'graphql-request'

import { calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

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
          granularity: calculateGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse: (response: Response<TrafficByUsageData>) => {
        return response.client.timeSeries
      }
    })
  })
})

export const { useTrafficByUsageQuery } = api

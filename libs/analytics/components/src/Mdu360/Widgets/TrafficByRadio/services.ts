/* eslint-disable max-len */
import { gql } from 'graphql-request'

import { calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

export type TrafficByBandData = {
  time: string[]
  userTraffic: number[]
  userTraffic_2_4: number[]
  userTraffic_5: number[]
  userTraffic_6: number[]
}

interface Response <TimeSeriesData> {
  client: {
    timeSeries: TimeSeriesData
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficByBand: build.query<
      TrafficByBandData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query ClientTrafficByBand($mac: String, $start: DateTime, $end: DateTime, $granularity: String) {
            client(mac: $mac, start: $start, end: $end) {
              timeSeries(granularity: $granularity) {
                time
                userTraffic
                userTraffic_2_4: userTraffic(band: "2.4")
                userTraffic_5: userTraffic(band: "5")
                userTraffic_6: userTraffic(band: "6")
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
      transformResponse: (response: Response<TrafficByBandData>) => {
        return response.client.timeSeries
      }
    })
  })
})

export const { useTrafficByBandQuery } = api

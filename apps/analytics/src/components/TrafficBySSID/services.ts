import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  totalClientTraffic: number
  topNSSIDByTraffic: TrafficBySSID[]
}

export type TrafficTimeseriesData = {
    timestamp: Date
    traffic: number
}

export type TrafficBySSID = {
    name: string
    traffic: number
    clientCount: number
    timeSeries: TrafficTimeseriesData[]
}

interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficBySSID: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query SSIDByTrafficWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $granularity: String!) {
          network(end: $end, start: $start) {
            hierarchyNode(path: $path) {
              totalClientTraffic: clientTraffic
              topNSSIDByTraffic: topNSSIDByTraffic(n: $n) {
                name
                traffic
                clientCount
                timeSeries(granularity: $granularity) {
                    timestamp
                    traffic
                }
              }
            }
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: 'fifteen_minute',
          n: 5
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTrafficBySSIDQuery } = api

import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  uploadAppTraffic: number
  downloadAppTraffic: number
  topNAppByUpload: TrafficByApplicationData[]
  topNAppByDownload: TrafficByApplicationData[]
}

export type TrafficTimeseriesData = {
    timestamp: Date
    traffic: number
}

export type TrafficByApplicationData = {
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
    trafficByApplication: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query TrafficByApplicationWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $granularity: String!) {
          network(end: $end, start: $start) {
            hierarchyNode(path: $path) {
              uploadAppTraffic: applicationTraffic(direction: "rx")
              downloadAppTraffic: applicationTraffic(direction: "tx")
              topNAppByUpload:topNApplicationByTraffic(n: $n, direction: "rx") {
                ...applicationTrafficData
              }
              topNAppByDownload:topNApplicationByTraffic(n: $n, direction: "tx") {
                ...applicationTrafficData
              }
            }
          }
        }
        
        fragment applicationTrafficData on ApplicationTrafficTopN{
          name
          traffic
          clientCount
          timeSeries(granularity: $granularity) {
            timestamp
            traffic
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

export const { useTrafficByApplicationQuery } = api

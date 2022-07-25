import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  totalTraffic: number
  topNAppByUpload: TrafficByApplicationData[]
  topNAppByDownload: TrafficByApplicationData[]
}

export type TrafficTimeseriesData = {
    timestamp: Date
    traffic: number
    txBytes: number
    rxBytes: number
    clientMacCount: number
}

export type TrafficByApplicationData = {
    appName: string
    totalTraffic: number
    txBytes: number
    rxBytes: number
    clientMacCount: number
    timeseries: TrafficTimeseriesData[]
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
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
        query HierarchyNode($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime,
          $n: Int!, $granularity: String!) {
          network(end: $end, start: $start) {
            hierarchyNode(path: $path) {
              totalTraffic
              topNAppByUpload:topNApplicationByTraffic(n: $n, direction: "rx") {
                ...applicationTrafficData
              }
              topNAppByDownload:topNApplicationByTraffic(n: $n, direction: "tx") {
                ...applicationTrafficData
              }
            }
          }
        }
        
        fragment applicationTrafficData on ApplicationTraffic{
          appName
          traffic
          rxBytes
          txBytes
          clientMacCount
          timeseries(granularity: $granularity) {
            timestamp
            rxBytes
            txBytes
            traffic
            clientMacCount
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: 'hour',
          n: 5
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTrafficByApplicationQuery } = api

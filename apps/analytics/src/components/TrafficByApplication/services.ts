import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  uploadAppTraffic: number
  downloadAppTraffic: number
  topNAppByUpload: TrafficByApplicationData[]
  topNAppByDownload: TrafficByApplicationData[]
}

export type TrafficTimeseriesData = {
    timestamp: Date
    txBytes: number
    rxBytes: number
}

export type TrafficByApplicationData = {
    appName: string
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
              uploadAppTraffic: appTraffic(direction: "rx")
              downloadAppTraffic: appTraffic(direction: "tx")
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
          rxBytes
          txBytes
          clientMacCount
          timeseries(granularity: $granularity) {
            timestamp
            rxBytes
            txBytes
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

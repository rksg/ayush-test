import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

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
    download: number
    upload: number
    clientMacCount: number
    timeseries: TrafficTimeseriesData[]
}

interface Response <T> {
  network: {
    hierarchyNode: {
        topNApplicationByTraffic: T[]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficByApplication: build.query<
      TrafficByApplicationData[],
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
        query HierarchyNode($path: [HierarchyNodeInput], $end: DateTime, $start: DateTime,
             $n: Int!, $granularity: String) {
            network(end: $end, start: $start) {
              hierarchyNode(path: $path) {
                topNApplicationByTraffic(n: $n) {
                  appName
                  totalTraffic:traffic
                  download:txBytes
                  upload:rxBytes
                  clientMacCount
                  timeseries(granularity: $granularity) {
                    timestamp
                    traffic
                    txBytes
                    rxBytes
                    clientMacCount
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
          granularity: 'hour',
          n: 5
        }
      }),
      transformResponse: (response: Response<TrafficByApplicationData>) =>
        response.network.hierarchyNode.topNApplicationByTraffic
    })
  })
})

export const { useTrafficByApplicationQuery } = api

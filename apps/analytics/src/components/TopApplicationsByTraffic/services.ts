import { gql } from 'graphql-request'


import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

import { getSparklineGranularity } from '../../utils'

export type HierarchyNodeData = {
  uploadAppTraffic: number
  downloadAppTraffic: number
  topNAppByUpload: TopApplicationByTrafficData[]
  topNAppByDownload: TopApplicationByTrafficData[]
}

export type TrafficTimeseriesData = {
    applicationTraffic: number[]
}

export type TopApplicationByTrafficData = {
    name: string
    applicationTraffic: number
    clientCount: number
    timeSeries: TrafficTimeseriesData
}

interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topApplicationsByTraffic: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query TopApplicationsByTrafficWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $granularity: String!, $filter: FilterInput) {
          network(end: $end, start: $start, filter : $filter) {
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
          applicationTraffic
          clientCount
          timeSeries(granularity: $granularity) {
            applicationTraffic
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: getSparklineGranularity(payload.startDate, payload.endDate),
          n: 5,
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopApplicationsByTrafficQuery } = api

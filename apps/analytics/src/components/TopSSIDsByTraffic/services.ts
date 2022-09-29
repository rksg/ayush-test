import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

import { getSparklineGranularity } from '../../utils'

export type HierarchyNodeData = {
  totalUserTraffic: number
  topNSSIDByTraffic: TopSSIDsByTraffic[]
}

export type TrafficTimeseriesData = {
    userTraffic: number[]
}

export type TopSSIDsByTraffic = {
    name: string
    userTraffic: number
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
    topSSIDsByTraffic: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query TopSSIDsByTrafficWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $granularity: String!, $filter: FilterInput) {
          network(end: $end, start: $start,filter : $filter) {
            hierarchyNode(path: $path) {
              totalUserTraffic: userTraffic
              topNSSIDByTraffic: topNSSIDByTraffic(n: $n) {
                name
                userTraffic
                clientCount
                timeSeries(granularity: $granularity) {
                    userTraffic
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

export const { useTopSSIDsByTrafficQuery } = api

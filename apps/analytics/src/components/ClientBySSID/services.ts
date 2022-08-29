import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

import { getSparklineGranularity } from '../../utils'

export type HierarchyNodeData = {
  totalUserTraffic: number
  topNSSIDByClient: ClientBySSID[]
}

export type TrafficTimeseriesData = {
    userTraffic: number[]
}

export type ClientBySSID = {
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
    ClientBySSID: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query ClientBySSIDWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $granularity: String!) {
          network(end: $end, start: $start) {
            hierarchyNode(path: $path) {
              totalUserTraffic: userTraffic
              topNSSIDByClient: topNSSIDByClient(n: $n) {
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
          n: 5
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useClientBySSIDQuery } = api

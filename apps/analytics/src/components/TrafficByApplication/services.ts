import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  uploadAppTraffic: number
  downloadAppTraffic: number
  topNAppByUpload: TrafficByApplicationData[]
  topNAppByDownload: TrafficByApplicationData[]
}

export type TrafficTimeseriesData = {
    applicationTraffic: number[]
}

export type TrafficByApplicationData = {
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

export const calcGranularity = (start: string, end: string): string => {
  const duration = moment.duration(moment(end).diff(moment(start))).asHours()
  if (duration >= 24 * 7) return 'PT24H' // 1 day if duration >= 7 days
  if (duration >= 24) return 'PT1H'
  if (duration >= 1) return 'PT15M'
  return 'PT180S'
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
          granularity: calcGranularity(payload.startDate, payload.endDate),
          n: 5
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTrafficByApplicationQuery } = api

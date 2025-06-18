/* eslint-disable max-len */
import { gql } from 'graphql-request'

import { calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import { NetworkPath }          from '@acx-ui/utils'

export type TrafficSnapshotData = {
  userTraffic_24: number[]
  userTraffic_5: number[]
  userTraffic_6: number[]
}

interface Payload {
  path: NetworkPath
  startDate: string,
  endDate: string
}

interface Response <TimeSeriesData> {
  network: {
    hierarchyNode: {
      timeSeries: TimeSeriesData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficSnapshot: build.query<
      TrafficSnapshotData,
      Payload
    >({
      query: (payload) => ({
        document: gql`
          query TrafficSnapshotWidget(
            $path: [HierarchyNodeInput]
            $start: DateTime, 
            $end: DateTime,
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  userTraffic_6: userTraffic(band: "6")
                  userTraffic_5: userTraffic(band: "5")
                  userTraffic_24: userTraffic(band: "2.4")
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse: (response: Response<TrafficSnapshotData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useTrafficSnapshotQuery } = api

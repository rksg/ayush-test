import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export interface TrafficByVolumeData {
  time: string[]
  totalTraffic_all: number[]
  totalTraffic_6: number[]
  totalTraffic_5: number[]
  totalTraffic_24: number[]
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
    trafficByVolume: build.query<
      TrafficByVolumeData,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
          query TrafficByVolumeWidget(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  time
                  totalTraffic_all: totalTraffic
                  totalTraffic_6: totalTraffic(radio: "6(5)")
                  totalTraffic_5: totalTraffic(radio: "5")
                  totalTraffic_24: totalTraffic(radio: "2.4")
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: 'PT15M'
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'TRAFFIC_BY_VOLUME' }],
      transformResponse: (response: Response<TrafficByVolumeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useTrafficByVolumeQuery } = api

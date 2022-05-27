import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export interface TrafficByVolumeData {
  time: string[]
  traffic_all: number[]
  traffic_6: number[]
  traffic_5: number[]
  traffic_24: number[]
}

interface Response <TimeSeriesData> {
  network: {
    hierarchyNode: {
      timeSeries: TimeSeriesData
    }
  }
}

const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficByVolume: build.query<
      TrafficByVolumeData,
      GlobalFilter
    >({
      // todo: change to the schema of real api
      query: (payload) => ({
        document: gql`
          query widget(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  time
                  traffic_all: traffic
                  traffic_6: traffic(radio: "6")
                  traffic_5: traffic(radio: "5")
                  traffic_24: traffic(radio: "2.4")
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

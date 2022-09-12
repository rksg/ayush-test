import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type SwitchesTrafficByVolumeData = {
  time: string[]
  switchTotalTraffic: number[]
  switchTotalTraffic_tx: number[]
  switchTotalTraffic_rx: number[]
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
    switchesTrafficByVolume: build.query<
    SwitchesTrafficByVolumeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query SwitchesTrafficByVolumeWidget(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  time
                  switchTotalTraffic: switchTotalTraffic
                  switchTotalTraffic_tx: switchTotalTraffic(direction: "tx")
                  switchTotalTraffic_rx: switchTotalTraffic(direction: "rx")
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
      transformResponse: (response: Response<SwitchesTrafficByVolumeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useSwitchesTrafficByVolumeQuery } = api

import { gql } from 'graphql-request'

import { getFilterPayload, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                                from '@acx-ui/store'
import type { AnalyticsFilter }                   from '@acx-ui/utils'

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
      AnalyticsFilter & { selectedPorts: string[] }
    >({
      query: (payload) => ({
        document: gql`
          query SwitchesTrafficByVolumeWidget(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
            $filter: FilterInput
            $ports: [String]
          ) {
            network(start: $start, end: $end, filter : $filter) {
              hierarchyNode(path: $path) {
              timeSeries(granularity: $granularity) {
                time
                switchTotalTraffic: switchTotalTraffic(portNumbers: $ports)
                switchTotalTraffic_tx: switchTotalTraffic(direction: "tx", portNumbers: $ports)
                switchTotalTraffic_rx: switchTotalTraffic(direction: "rx", portNumbers: $ports)
              }
            }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate),
          ports: payload.selectedPorts,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<SwitchesTrafficByVolumeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useSwitchesTrafficByVolumeQuery } = api

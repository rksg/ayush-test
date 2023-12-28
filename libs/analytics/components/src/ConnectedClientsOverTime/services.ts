import { gql } from 'graphql-request'

import { getFilterPayload, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                                from '@acx-ui/store'
import type { AnalyticsFilter }                   from '@acx-ui/utils'

export type ConnectedClientsOverTimeData = {
  uniqueUsers_all: number[]
  uniqueUsers_6: number[]
  uniqueUsers_5: number[]
  uniqueUsers_24: number[]
  time: string[]
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
    connectedClientsOverTime: build.query<
    ConnectedClientsOverTimeData,
    AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query ConnectedClientsOverTimeWidget(
          $path: [HierarchyNodeInput]
          $start: DateTime
          $end: DateTime
          $granularity: String
          $filter: FilterInput
        ) {
          network(start: $start, end: $end,filter : $filter) {
            hierarchyNode(path: $path) {
              timeSeries(granularity: $granularity) {
                time
                uniqueUsers_all: connectedClientCount
                uniqueUsers_6: connectedClientCount(band: "6")
                uniqueUsers_5: connectedClientCount(band: "5")
                uniqueUsers_24: connectedClientCount(band: "2.4")
              }
            }
          }
        }
      `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate, 'PT15M'),
          ...getFilterPayload(payload)
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'CONNECTED_CLIENTS_OVER_TIME' }],
      transformResponse: (response: Response<ConnectedClientsOverTimeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useConnectedClientsOverTimeQuery } = api

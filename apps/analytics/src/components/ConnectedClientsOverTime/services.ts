import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

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
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
        query ConnectedClientsOverTimeWidget(
          $path: [HierarchyNodeInput]
          $start: DateTime
          $end: DateTime
          $granularity: String
        ) {
          network(start: $start, end: $end) {
            hierarchyNode(path: $path) {
              timeSeries(granularity: $granularity) {
                time
                uniqueUsers_all: clientCountByRadio
                uniqueUsers_6: clientCountByRadio(radio: "6")
                uniqueUsers_5: clientCountByRadio(radio: "5")
                uniqueUsers_24: clientCountByRadio(radio: "2.4")
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
      providesTags: [{ type: 'Monitoring', id: 'CONNECTED_CLIENTS_OVER_TIME' }],
      transformResponse: (response: Response<ConnectedClientsOverTimeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useConnectedClientsOverTimeQuery } = api

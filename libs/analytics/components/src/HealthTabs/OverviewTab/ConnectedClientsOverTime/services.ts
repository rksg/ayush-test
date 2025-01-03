import { gql } from 'graphql-request'

import { getFilterPayload, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                                from '@acx-ui/store'
import type { AnalyticsFilter }                   from '@acx-ui/utils'

export type ConnectedClientsOverTimeData = {
  wirelessClientsCount: number[]
  wiredClientsCount: number[]
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
    healthConnectedClientsOverTime: build.query<
    ConnectedClientsOverTimeData,
    AnalyticsFilter & {
      isSwitchHealth10010eEnabled: boolean
    }
    >({
      query: (payload) => ({
        document: gql`
        query HealthConnectedClientsOverTimeWidget(
          $path: [HierarchyNodeInput]
          $start: DateTime
          $end: DateTime
          $granularity: String
          $filter: FilterInput,
          $enableSwitchFirmwareFilter: Boolean
        ) {
          network(start: $start, end: $end,filter : $filter,
            enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
          ) {
            hierarchyNode(path: $path) {
              timeSeries(granularity: $granularity) {
                time
                wirelessClientsCount: connectedClientCount
                ${payload.isSwitchHealth10010eEnabled ?
          'wiredClientsCount: switchConnectedClientCount' : ''}
              }
            }
          }
        }
      `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate, 'PT15M'),
          ...getFilterPayload(payload),
          enableSwitchFirmwareFilter: true
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'CONNECTED_CLIENTS_OVER_TIME' }],
      transformResponse: (response: Response<ConnectedClientsOverTimeData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useHealthConnectedClientsOverTimeQuery } = api

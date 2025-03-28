import { gql } from 'graphql-request'

import {
  calculateGranularity,
  getFilterPayload,
  IncidentFilter,
  IncidentsToggleFilter,
  incidentsToggle
} from '@acx-ui/analytics/utils'
import { dataApi } from '@acx-ui/store'

export type NetworkHistoryData = {
  connectedClientCount: number[]
  impactedClientCount: number[]
  newClientCount: number[]
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
    networkHistory: build.query<
      NetworkHistoryData,
      IncidentFilter & IncidentsToggleFilter & { hideIncidents: boolean, apCount?: number }
    >({
      // todo: Skipping the filter for impactedClientCount
      query: (payload) => ({
        document: gql`
            query NetworkHistoryWidget(
            $path:[HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $granularity: String,
            $severity: [Range],
            $code: [String],
            $filter: FilterInput
            ){
            network(start: $start end: $end, filter : $filter){
                hierarchyNode(path:$path){
                timeSeries(granularity:$granularity){
                    time
                    newClientCount: connectionAttemptCount
                    impactedClientCount: impactedClientCountBySeverity(
                        filter:{severity:$severity, code: $code}
                    )
                    connectedClientCount
                }
                }
            }
            }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(
            payload.startDate,
            payload.endDate
          ),
          severity: [{ gt: 0, lte: 1 }], // all severities
          code: incidentsToggle(payload),
          ...getFilterPayload(payload)
        }
      }),
      providesTags: [
        { type: 'Monitoring', id: 'NETWORK_HISTORY' },
        { type: 'Monitoring', id: 'INCIDENTS_LIST' }
      ],
      transformResponse: (response: Response<NetworkHistoryData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useNetworkHistoryQuery } = api

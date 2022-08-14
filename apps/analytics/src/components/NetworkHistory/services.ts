import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { dataApi }                                      from '@acx-ui/analytics/services'
import { AnalyticsFilter, incidentCodes, IncidentCode } from '@acx-ui/analytics/utils'

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

export const calcGranularity = (start: string, end: string): string => {
  const duration = moment.duration(moment(end).diff(moment(start))).asHours()
  if (duration > 24 * 7) return 'PT1H' // 1 hour if duration > 7 days
  if (duration > 1) return 'PT30M'
  return 'PT180S'
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkHistory: build.query<
      NetworkHistoryData,
      AnalyticsFilter & { code? : IncidentCode[] }
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
            $code: [String]
            ){
            network(start: $start end: $end){
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
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calcGranularity(payload.startDate, payload.endDate),
          severity: [{ gt: 0, lte: 1 }], // all severities
          code: payload.code ?? incidentCodes
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'NETWORK_HISTORY' }],
      transformResponse: (response: Response<NetworkHistoryData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useNetworkHistoryQuery } = api

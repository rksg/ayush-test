import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { dataApi }                        from '@acx-ui/analytics/services'
import { AnalyticsFilter, incidentCodes } from '@acx-ui/analytics/utils'

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

const severity = [
  {
    gt: 0.9,
    lte: 1
  },
  {
    gt: 0.75,
    lte: 0.9
  },
  {
    gt: 0.6,
    lte: 0.75
  },
  {
    gt: 0,
    lte: 0.6
  }
]


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
      AnalyticsFilter
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
          severity: severity,
          code: incidentCodes
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'NETWORK_HISTORY' }],
      transformResponse: (response: Response<NetworkHistoryData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useNetworkHistoryQuery } = api

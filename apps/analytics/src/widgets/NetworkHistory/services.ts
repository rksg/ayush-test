import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export interface NetworkHistoryData {
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
// TODO: Make it dynamic
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
// TODO: Make it dynamic
const code = [
  'ttc',
  'ttc+radius-failure',
  'ttc+auth-failure',
  'ttc+assoc-failure',
  'ttc+eap-failure',
  'ttc+dhcp-failure',
  'radius-failure',
  'high-radius-failure',
  'eap-failure',
  'high-eap-failure',
  'dhcp-failure',
  'high-dhcp-failure',
  'auth-failure',
  'high-auth-failure',
  'assoc-failure',
  'high-assoc-failure',
  'p-cov-clientrssi-low',
  'p-load-sz-cpu-load',
  'p-switch-memory-high',
  'p-channeldist-suboptimal-plan-24g',
  'p-channeldist-suboptimal-plan-50g-outdoor',
  'p-channeldist-suboptimal-plan-50g-indoor',
  'i-net-time-future',
  'i-net-time-past',
  'i-net-sz-net-latency',
  'i-apserv-high-num-reboots',
  'i-apserv-continuous-reboots',
  'i-apserv-downtime-high',
  'i-switch-vlan-mismatch',
  'i-switch-poe-pd',
  'i-apinfra-poe-low',
  'i-apinfra-wanthroughput-low'
]

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkHistory: build.query<
      NetworkHistoryData,
      GlobalFilter
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
          granularity: 'PT15M',
          severity: severity, //TODO: Fetch severity dynamically
          code: code //TODO: Fetch code dynamically
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'NETWORK_HISTORY' }],
      transformResponse: (response: Response<NetworkHistoryData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useNetworkHistoryQuery } = api

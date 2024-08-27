import { gql } from 'graphql-request'

import { getSelectedNodePath } from '@acx-ui/analytics/utils'
import { dataApi }             from '@acx-ui/store'
import type { NodesFilter }    from '@acx-ui/utils'


export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
}

export interface WiredSummaryResult {
  switchDHCP: {
    attemptCount: number
    successCount: number
  },
  switchCpuUtilizationPct: number
  stormPortCount: number
  portCount: number
  uplinkPortCount: number
  congestedPortCount: number
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    wiredSummaryData: build.query<WiredSummaryResult, RequestPayload>({
      query: payload => {
        return ({
          document: gql`
          query WiredSummaryQuery(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput,
          $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter,
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                switchDHCP {
                  attemptCount
                  successCount
                }
                switchCpuUtilizationPct
                portCount
                uplinkPortCount
                congestedPortCount
                stormPortCount
              }
            }
          }`,
          variables: {
            ...payload,
            path: getSelectedNodePath(payload.filter),
            enableSwitchFirmwareFilter: true
          }
        })
      },
      providesTags: [{ type: 'Health', id: 'WIRED_SUMMARY' }],
      transformResponse: (response: {
        network: { hierarchyNode: WiredSummaryResult } }) => response.network.hierarchyNode
    })
  })
})

export const {
  useWiredSummaryDataQuery
} = api

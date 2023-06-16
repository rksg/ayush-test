import { gql } from 'graphql-request'

import { getFilterPayload, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'

export type SwitchesByPoEUsageData = {
  name: string
  usage: number
  usagePct: number
}

interface Response <SwitchesByPoeUsageData> {
  network: {
    hierarchyNode: {
      topNSwitchesByPoEUsage: SwitchesByPoeUsageData[]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topSwitchesByPoEUsage: build.query<
      SwitchesByPoEUsageData[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query SwitchesByPoEUsage(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $filter: FilterInput
          ) {
            network(start: $start, end: $end,filter : $filter) {
              hierarchyNode(path: $path) {
                topNSwitchesByPoEUsage(n: 5) {
                  name,
                  usage: poeUtilization,
                  usagePct: poeUtilizationPct,
                  mac,
                  serial
                }
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<SwitchesByPoEUsageData>) =>
        response.network.hierarchyNode.topNSwitchesByPoEUsage
    })
  })
})

export const { useTopSwitchesByPoEUsageQuery } = api

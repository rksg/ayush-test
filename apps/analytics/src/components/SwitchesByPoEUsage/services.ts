import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type SwitchesByPoEUsageData = {
  name: string
  poeUtilization: number
  poeUtilizationPct: number
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
    switchesByPoEUsage: build.query<
      SwitchesByPoEUsageData[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query SwitchesByPoEUsage(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                topNSwitchesByPoEUsage(n: 5) {
                  name,
                  poeUtilization,
                  poeUtilizationPct
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      transformResponse: (response: Response<SwitchesByPoEUsageData>) =>
        response.network.hierarchyNode.topNSwitchesByPoEUsage
    })
  })
})

export const { useSwitchesByPoEUsageQuery } = api

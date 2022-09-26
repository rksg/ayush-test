import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

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
                  mac
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload.filter ?? {}
        }
      }),
      transformResponse: (response: Response<SwitchesByPoEUsageData>) =>
        response.network.hierarchyNode.topNSwitchesByPoEUsage
    })
  })
})

export const { useTopSwitchesByPoEUsageQuery } = api

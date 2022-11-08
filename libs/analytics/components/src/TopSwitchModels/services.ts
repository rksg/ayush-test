import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type SwitchModel = {
  name: string
  count: number
}

interface Response <SwitchModels> {
  network: {
    hierarchyNode: {
      topNSwitchModels: SwitchModels[]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topSwitchModels: build.query<
      SwitchModel[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query topSwitchModels (
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $filter: FilterInput
          ) {
            network(start: $start, end: $end,filter : $filter) {
              hierarchyNode(path: $path) {
                topNSwitchModels(n: 5) {
                  name
                  count
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<SwitchModel>) =>
        response.network.hierarchyNode.topNSwitchModels
    })
  })
})

export const { useTopSwitchModelsQuery } = api

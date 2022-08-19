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
      topNSwitchModelsByCount: SwitchModels[]
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
          query TopSwitchModelsByCount (
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                topNSwitchModelsByCount(n: 5) {
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
          end: payload.endDate
        }
      }),
      transformResponse: (response: Response<SwitchModel>) =>
        response.network.hierarchyNode.topNSwitchModelsByCount
    })
  })
})

export const { useTopSwitchModelsQuery } = api

import { gql } from 'graphql-request'
import moment  from 'moment'

import { dataApi }                         from '@acx-ui/analytics/services'
import { AnalyticsFilter, DidYouKnowData } from '@acx-ui/analytics/utils'

interface Response <FactsData> {
  network: {
    hierarchyNode: {
      facts: FactsData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    didYouKnow: build.query<
      DidYouKnowData[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query DidYouKnowWidget(
          $path: [HierarchyNodeInput], 
          $start: DateTime, 
          $end: DateTime, 
          $filter: FilterInput
        ) {
          network(start: $start, end: $end, filter : $filter) {
            hierarchyNode(path: $path) {
              facts(n: 9, timeZone: "${moment.tz.guess()}") {
                key values labels
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
      transformResponse: (response: Response<DidYouKnowData[]>) =>
        response.network.hierarchyNode.facts
    })
  })
})

export const { useDidYouKnowQuery } = api

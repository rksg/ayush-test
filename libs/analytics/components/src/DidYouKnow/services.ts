import { gql } from 'graphql-request'
import moment  from 'moment'

import { getFilterPayload }     from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { DidYouKnowData } from './facts'

interface Response <FactsData> {
  network: {
    hierarchyNode: {
      facts: FactsData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    facts: build.query<
      DidYouKnowData[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query Facts(
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
          start: payload.startDate,
          end: payload.endDate,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<DidYouKnowData[]>) =>
        response.network.hierarchyNode.facts
    })
  })
})

export const { useFactsQuery } = api

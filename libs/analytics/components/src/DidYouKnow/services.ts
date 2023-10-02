import { gql } from 'graphql-request'
import _       from 'lodash'
import moment  from 'moment'

import { getFilterPayload }                 from '@acx-ui/analytics/utils'
import { dataApi }                          from '@acx-ui/store'
import type { DashboardFilter, PathFilter } from '@acx-ui/utils'

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
      PathFilter | DashboardFilter
    >({
      query: (payload) => {
        const useFilter = 'filter' in payload
        let variables: Partial<PathFilter> | Partial<DashboardFilter>
        if (useFilter) {
          variables = {
            startDate: payload.startDate,
            endDate: payload.endDate,
            ...getFilterPayload(payload)
          }
        } else {
          variables = _.pick(payload, ['path', 'startDate', 'endDate'])
        }
        return {
          document: gql`
          query Facts(
            ${useFilter ? '$filter: FilterInput' : ''},
            $path: [HierarchyNodeInput]
            $startDate: DateTime,
            $endDate: DateTime
          ) {
            network(start: $startDate, end: $endDate${useFilter ? ', filter: $filter' : ''}) {
              hierarchyNode(path: $path) {
                facts(n: 9, timeZone: "${moment.tz.guess()}") {
                  key values labels
                }
              }
            }
          }
          `,
          variables
        }
      },
      transformResponse: (response: Response<DidYouKnowData[]>) =>
        response.network.hierarchyNode.facts
    })
  })
})

export const { useFactsQuery } = api

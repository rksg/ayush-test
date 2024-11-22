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
      facts: FactsData,
      availableFacts: string[]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    facts: build.query<
      {
        facts: DidYouKnowData[]
        availableFacts: string[]
      },
      (PathFilter | DashboardFilter) & { requestedList: string[] }
        >({
          query: (payload) => {
            const useFilter = 'filter' in payload
            let variables: (Partial<PathFilter> | Partial<DashboardFilter>) & {
          requestedList: string[]
        }
            const startDate = moment()
              .startOf('day')
              .subtract(7, 'days')
              .format('YYYY-MM-DDTHH:mm:ss+08:00')
            const endDate = moment()
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss+08:00')
            if (useFilter) {
              variables = {
                startDate: startDate,
                endDate: endDate,
                ...getFilterPayload(payload),
                requestedList: payload.requestedList
              }
            } else {
              variables = Object.assign(_.pick(payload, ['path', 'requestedList']),
                startDate, endDate)
            }
            return {
              document: gql`
          query Facts(
            ${useFilter ? '$filter: FilterInput' : ''},
            $path: [HierarchyNodeInput]
            $startDate: DateTime,
            $endDate: DateTime
            $requestedList: [String]
          ) {
            network(start: $startDate, end: $endDate${useFilter ? ', filter: $filter' : ''}) {
              hierarchyNode(path: $path) {
                facts(n: 2, timeZone: "${moment.tz.guess()}", requestedList: $requestedList) {
                  key values labels
                }
                availableFacts(timeZone: "${moment.tz.guess()}")
              }
            }
          }
          `,
              variables
            }
          },
          transformResponse: (response: Response<DidYouKnowData[]>) => ({
            facts: response.network.hierarchyNode.facts,
            availableFacts: response.network.hierarchyNode.availableFacts
          })
        })
  })
})

export const { useFactsQuery } = api

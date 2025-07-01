import { gql } from 'graphql-request'
import _       from 'lodash'
import moment  from 'moment'

import { getFilterPayload }                 from '@acx-ui/analytics/utils'
import { dataApi }                          from '@acx-ui/store'
import type { DashboardFilter, PathFilter } from '@acx-ui/utils'

import { DidYouKnowData, getFactsData } from './facts'

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
    customFacts: build.query<
      ReturnType<typeof getFactsData>,
      (PathFilter | DashboardFilter) & { requestedList: string[] }
        >({
          query: (payload) => {
            const useFilter = 'filter' in payload
            const timeRange = getWeekRange()
            const filterVariables = getFilterVariables(payload)
            return {
              document: gql`
                query Facts(
                  ${useFilter ? '$filter: FilterInput' : ''}
                  $path: [HierarchyNodeInput]
                  $startDate: DateTime
                  $endDate: DateTime
                  $requestedList: [String]
                ) {
                  network(start: $startDate, end: $endDate${useFilter ? ', filter: $filter' : ''}) {
                    hierarchyNode(path: $path) {
                      facts(n: 1, timeZone: "${moment.tz.guess()}", requestedList: $requestedList) {
                        key values labels
                      }
                    }
                  }
                }
              `,
              variables: {
                ...timeRange,
                ...filterVariables,
                requestedList: payload.requestedList
              }
            }
          },
          transformResponse: (response: Response<DidYouKnowData[]>) =>
            getFactsData(response.network.hierarchyNode.facts)
        }),
    availableFacts: build.query<
      string[][],
      (PathFilter | DashboardFilter)
        >({
          query: (payload) => {
            const useFilter = 'filter' in payload
            const baseVariables = getWeekRange()
            const filterVariables = getFilterVariables(payload)
            return {
              document: gql`
                query AvailableFacts(
                  ${useFilter ? '$filter: FilterInput' : ''}
                  $path: [HierarchyNodeInput]
                  $startDate: DateTime
                  $endDate: DateTime
                ) {
                  network(start: $startDate, end: $endDate${useFilter ? ', filter: $filter' : ''}) {
                    hierarchyNode(path: $path) {
                      availableFacts(timeZone: "${moment.tz.guess()}")
                    }
                  }
                }
              `,
              variables: {
                ...baseVariables,
                ...filterVariables
              }
            }
          },
          transformResponse: (response: Response<string[][]>) =>
            _(response.network.hierarchyNode.availableFacts).chunk(1).value()
        })
  })
})

export const { useCustomFactsQuery, useAvailableFactsQuery } = api

export function useFactsQuery (
  factsSets: string[][] | undefined,
  loaded: string[],
  offset: number,
  filters: PathFilter | DashboardFilter) {

  const hasData = Boolean(factsSets?.length &&
    factsSets[offset].every(key => loaded.includes(key)))

  return useCustomFactsQuery(
    { ...filters, requestedList: factsSets?.[offset] ?? [] },
    { skip: hasData || _.isEmpty(factsSets) }
  )
}

const getFilterVariables = (payload: (PathFilter | DashboardFilter)) => {
  return 'filter' in payload ? getFilterPayload(payload) : _.pick(payload, ['path'])
}

const getWeekRange = () => {
  const today = moment().startOf('day')
  return {
    startDate: today.clone().subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ssZ'),
    endDate: today.format('YYYY-MM-DDTHH:mm:ssZ')
  }
}

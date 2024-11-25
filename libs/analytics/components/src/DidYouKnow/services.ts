import { gql } from 'graphql-request'
import _       from 'lodash'
import moment  from 'moment'

import { getFilterPayload }                 from '@acx-ui/analytics/utils'
import { get }                              from '@acx-ui/config'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
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
      {
        facts: DidYouKnowData[]
        availableFacts: string[]
      },
      (PathFilter | DashboardFilter) & { requestedList: string[], weekRange: boolean }
        >({
          query: (payload) => {
            const useFilter = 'filter' in payload
            let variables: (Partial<PathFilter> | Partial<DashboardFilter>) & {
          requestedList: string[]
        }
            let startDate, endDate
            if (payload.weekRange) {
              startDate = moment()
                .startOf('day')
                .subtract(7, 'days')
                .format('YYYY-MM-DDTHH:mm:ss+08:00')
              endDate = moment()
                .startOf('day')
                .format('YYYY-MM-DDTHH:mm:ss+08:00')
            } else {
              startDate = payload.startDate
              endDate = payload.endDate
            }
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

export const { useCustomFactsQuery } = api

export function useFactsQuery (
  maxFactPerSlide: number | undefined,
  maxSlideChar: number | undefined,
  carouselFactsMap: Record<number, { facts: string[] }>,
  content: string[][],
  offset: number,
  filters: PathFilter | DashboardFilter) {

  const isSplitOn = useIsSplitOn(Features.ANALYTIC_SNAPSHOT_TOGGLE)
  const weekRange = Boolean(get('IS_MLISA_SA')) || isSplitOn

  return useCustomFactsQuery(
    { ...filters, requestedList: carouselFactsMap?.[offset]?.facts, weekRange },
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getFactsData(data?.facts!, { maxFactPerSlide, maxSlideChar }),
        availableFacts: data?.availableFacts,
        initialLoadedFacts: data?.facts.map((fact) => fact.key),
        ...rest
      }),
      skip: !Boolean(content[offset]?.length === 0 )
    }
  )
}

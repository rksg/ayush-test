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
            let variables: (Partial<PathFilter> | Partial<DashboardFilter>)
              & { requestedList: string[] }
            const { startDate, endDate } = payload.weekRange ?
              getWeekRange() :
              getRangeByFilter(payload)
            const baseVariables = { startDate, endDate, requestedList: payload.requestedList }
            variables = useFilter ?
              { ...baseVariables, ...getFilterPayload(payload) } :
              { ...baseVariables, ..._.pick(payload, ['path']) }
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
        }),
    availableFacts: build.query<string[], (PathFilter | DashboardFilter) & { weekRange: boolean }>({
      query: (payload) => {
        const useFilter = 'filter' in payload
        let variables: (Partial<PathFilter> | Partial<DashboardFilter>)
        const { startDate, endDate } = payload.weekRange ?
          getWeekRange() :
          getRangeByFilter(payload)
        const baseVariables = { startDate, endDate }
        variables = useFilter ?
          { ...baseVariables, ...getFilterPayload(payload) } :
          { ...baseVariables, ..._.pick(payload, ['path']) }
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
                  availableFacts(timeZone: "${moment.tz.guess()}")
                }
              }
            }
          `,
          variables
        }
      },
      transformResponse: (response: Response<string[]>) => {
        return response.network.hierarchyNode.availableFacts
      }
    })
  })
})

export const { useCustomFactsQuery, useAvailableFactsQuery } = api

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

const getWeekRange = () => {
  const today = moment().startOf('day')
  return {
    startDate: today.clone().subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ssZ'),
    endDate: today.format('YYYY-MM-DDTHH:mm:ssZ')
  }
}

const getRangeByFilter = (filters: PathFilter | DashboardFilter) => {
  let startDate = filters.startDate
  let endDate = filters.endDate
  return { startDate, endDate }
}

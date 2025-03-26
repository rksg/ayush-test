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
      ReturnType<typeof getFactsData>,
      (PathFilter | DashboardFilter) & { requestedList: string[], weekRange: boolean }
        >({
          query: (payload) => {
            const useFilter = 'filter' in payload
            const baseVariables = getBaseVariables(payload)
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
                ...baseVariables,
                ...filterVariables,
                requestedList: payload.requestedList
              }
            }
          },
          transformResponse: (response: Response<DidYouKnowData[]>) =>
            getFactsData(response.network.hierarchyNode.facts)
        }),
    customAvailableFacts: build.query<
      string[][],
      (PathFilter | DashboardFilter) & { weekRange: boolean }
        >({
          query: (payload) => {
            const useFilter = 'filter' in payload
            const baseVariables = getBaseVariables(payload)
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

export const { useCustomFactsQuery, useCustomAvailableFactsQuery } = api

export function useFactsQuery (
  factsSets: string[][] | undefined,
  loaded: string[],
  offset: number,
  filters: PathFilter | DashboardFilter) {
  const isSplitOn = useIsSplitOn(Features.ANALYTIC_SNAPSHOT_TOGGLE)
  const weekRange = Boolean(get('IS_MLISA_SA')) || isSplitOn

  const hasData = Boolean(factsSets?.length &&
    factsSets[offset].every(key => loaded.includes(key)))

  return useCustomFactsQuery(
    { ...filters, requestedList: factsSets?.[offset] ?? [], weekRange },
    { skip: hasData || _.isEmpty(factsSets) }
  )
}

export function useAvailableFactsQuery (filters: PathFilter | DashboardFilter) {
  const isSplitOn = useIsSplitOn(Features.ANALYTIC_SNAPSHOT_TOGGLE)
  const weekRange = Boolean(get('IS_MLISA_SA')) || isSplitOn
  return useCustomAvailableFactsQuery({ ...filters, weekRange })
}

const getBaseVariables = (payload: (PathFilter | DashboardFilter) & { weekRange: boolean }) => {
  const { startDate, endDate } = payload.weekRange ?
    getWeekRange() :
    getRangeByFilter(payload)
  return { startDate, endDate }
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

const getRangeByFilter = (filters: PathFilter | DashboardFilter) => ({
  startDate: filters.startDate,
  endDate: filters.endDate
})

import { gql }        from 'graphql-request'
import { omit, pick } from 'lodash'

import { CONFIG_CHANGE_DEFAULT_PAGINATION, type ConfigChange } from '@acx-ui/components'
import { dataApi }                                             from '@acx-ui/store'
import { NetworkPath, PathFilter }                             from '@acx-ui/utils'

interface Response<T> { network: { hierarchyNode: T } }

interface KpiChangesParams {
  kpis: string[],
  path: NetworkPath
  beforeStart: string
  beforeEnd: string
  afterStart: string
  afterEnd: string
}

interface ConfigChangePaginationParams {
  page?: number
  pageSize?: number
}
interface ConfigChangeFilterParams {
  entityType?: string[]
  entityName?: string
  kpiFilter?: string[]
}
export interface PagedConfigChange {
  total: number,
  data: ConfigChange[]
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    configChange: build.query<ConfigChange[],PathFilter>({
      query: (payload) => ({
        document: gql`
          query ConfigChange(
            $path: [HierarchyNodeInput],
            $startDate: DateTime,
            $endDate: DateTime
          ) {
            network(start: $startDate, end: $endDate) {
              hierarchyNode(path: $path) {
                configChanges {
                  timestamp
                  type
                  name
                  key
                  oldValues
                  newValues
                }
              }
            }
          }
        `,
        variables: pick(payload, ['path', 'startDate', 'endDate'])
      }),
      transformResponse: (
        response: Response<{ configChanges: ConfigChange[] }>) =>
        response.network.hierarchyNode.configChanges.map((value, id)=>({ ...value, id }))
    }),
    pagedConfigChange: build.query<
      PagedConfigChange,
      PathFilter & ConfigChangePaginationParams & { filterBy?: ConfigChangeFilterParams }
    >({
      query: (payload) => ({
        document: gql`
        query PagedConfigChange(
          $path: [HierarchyNodeInput],
          $startDate: DateTime,
          $endDate: DateTime,
          $page: Int
          $pageSize: Int
          $filterBy: JSON
        ) {
          network(start: $startDate, end: $endDate) {
            hierarchyNode(path: $path) {
              pagedConfigChanges(
                page: $page
                pageSize: $pageSize
                filterBy: $filterBy
              ) {
                total
                data {
                  timestamp
                  type
                  name
                  key
                  oldValues
                  newValues
                }
              }
            }
          }
        }
      `,
        variables: pick(payload, [
          'path', 'startDate', 'endDate', 'page', 'pageSize', 'filterBy'])
      }),
      transformResponse: (
        response: Response<{ pagedConfigChanges: PagedConfigChange }>,
        _,
        payload: ConfigChangePaginationParams
      ) => {
        return {
          ...response.network.hierarchyNode.pagedConfigChanges,
          data: response.network.hierarchyNode.pagedConfigChanges.data
            .map((value, id)=>({
              ...value,
              id: ((payload.page || CONFIG_CHANGE_DEFAULT_PAGINATION.current) - 1) *
                    (payload.pageSize || CONFIG_CHANGE_DEFAULT_PAGINATION.pageSize) + id
            }))
        }
      }
    }),
    configChangeSeries: build.query<
      ConfigChange[],
      PathFilter & { filterBy?: ConfigChangeFilterParams }
    >({
      query: (payload) => ({
        document: gql`
        query ConfigChangeSeries(
          $path: [HierarchyNodeInput],
          $startDate: DateTime,
          $endDate: DateTime,
          $filterBy: JSON
        ) {
          network(start: $startDate, end: $endDate) {
            hierarchyNode(path: $path) { 
              configChangeSeries(filterBy: $filterBy) { timestamp type } 
            }
          }
        }
      `,
        variables: pick(payload, ['path', 'startDate', 'endDate', 'filterBy'])
      }),
      transformResponse: (
        response: Response<{ configChangeSeries: ConfigChange[] }>) =>
        response.network.hierarchyNode.configChangeSeries.map((value, id)=>({ ...value, id }))
    }),
    configChangeKPIChanges: build.query<
      { before: Record<string, number>, after: Record<string, number> },
      KpiChangesParams
    >({
      query: (payload) => ({
        document: gql`
          query ConfigChangeKPIChanges(
            $path: [HierarchyNodeInput],
            $beforeStart: DateTime, $beforeEnd: DateTime,
            $afterStart: DateTime, $afterEnd: DateTime,
            $filter: FilterInput
          ) {
              network(filter: $filter) {
                before: KPI(path: $path, start: $beforeStart, end: $beforeEnd) {
                  ${payload.kpis.join('\n')}
                }
                after: KPI(path: $path, start: $afterStart, end: $afterEnd) {
                  ${payload.kpis.join('\n')}
                }
              }
          }
        `,
        variables: omit(payload, ['kpis'])
      }),
      transformResponse: (response: { network: {
        before: Record<string, number>, after: Record<string, number>
      } } ) => response.network
    })
  })
})

const {
  useConfigChangeQuery,
  usePagedConfigChangeQuery,
  useConfigChangeSeriesQuery,
  useConfigChangeKPIChangesQuery
} = api

function useKPIChangesQuery (params: KpiChangesParams) {
  return useConfigChangeKPIChangesQuery(params,
    { skip: Object.keys(params).some(key=>!params[key as keyof KpiChangesParams]) }
  )
}

export {
  useConfigChangeQuery,
  usePagedConfigChangeQuery,
  useConfigChangeSeriesQuery,
  useKPIChangesQuery
}

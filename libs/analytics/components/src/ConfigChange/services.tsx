import { gql }        from 'graphql-request'
import { omit, pick } from 'lodash'

import type { ConfigChange }       from '@acx-ui/components'
import { dataApi }                 from '@acx-ui/store'
import { NetworkPath, PathFilter } from '@acx-ui/utils'

interface KpiChangesParams {
  kpis: string[],
  path: NetworkPath,
  beforeStart: string,
  beforeEnd: string,
  afterStart: string,
  afterEnd: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    configChange: build.query<
      ConfigChange[],
      PathFilter
    >({
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
        response: { network: { hierarchyNode: { configChanges: ConfigChange[] } } } ) =>
        response.network.hierarchyNode.configChanges
          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
          .map((value, id)=>({ ...value, id }))
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
  useConfigChangeKPIChangesQuery
} = api

function useKPIChangesQuery (params: KpiChangesParams) {
  return useConfigChangeKPIChangesQuery(params,
    { skip: Object.keys(params).some(key=>!params[key as keyof KpiChangesParams]) }
  )
}

export {
  useConfigChangeQuery,
  useKPIChangesQuery
}

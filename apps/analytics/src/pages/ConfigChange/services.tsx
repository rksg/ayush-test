import { gql }  from 'graphql-request'
import { omit } from 'lodash'

import type { ConfigChange } from '@acx-ui/components'
import { dataApi }           from '@acx-ui/store'
import { PathNode }          from '@acx-ui/utils'

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    configChange: build.query<
      ConfigChange[], { path: PathNode[], start: string, end: string }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          query ConfigChange($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
            network(start: $start, end: $end) {
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
        `
      }),
      transformResponse: (
        response: { network: { hierarchyNode: { configChanges: ConfigChange[] } } } ) =>
        response.network.hierarchyNode.configChanges.map((value, id)=>({ ...value, id }))
    }),
    configChangeKPIChanges: build.query<
      { before: Record<string, number>, after: Record<string, number> },
      {
        kpis: string[],
        path: PathNode[],
        beforeStart: string,
        beforeEnd: string,
        afterStart: string,
        afterEnd: string
      }
    >({
      query: (variables) => ({
        variables: omit(variables, ['kpis']),
        document: gql`
          query ConfigChangeKPIChanges(
            $path: [HierarchyNodeInput],
            $beforeStart: DateTime, $beforeEnd: DateTime,
            $afterStart: DateTime, $afterEnd: DateTime
          ) {
              before: KPI(path: $path, start: $beforeStart, end: $beforeEnd) {
                ${variables.kpis.join('\n')}
              }
              after: KPI(path: $path, start: $afterStart, end: $afterEnd) {
                ${variables.kpis.join('\n')}
              }
          }
        `
      })
    })
  })
})

const {
  useConfigChangeQuery,
  useConfigChangeKPIChangesQuery
} = api

interface KpiChangesParams {
  kpis: string[],
  path: PathNode[],
  beforeStart: string,
  beforeEnd: string,
  afterStart: string,
  afterEnd: string
}

function useKPIChangesQuery (params: KpiChangesParams) {
  return useConfigChangeKPIChangesQuery(params,
    { skip: Object.keys(params).some(key=>!params[key as keyof KpiChangesParams]) }
  )
}

export {
  useConfigChangeQuery,
  useKPIChangesQuery
}

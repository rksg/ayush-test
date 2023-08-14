import { gql }  from 'graphql-request'
import { omit } from 'lodash'

import type { ConfigChange }     from '@acx-ui/components'
import { dataApi }               from '@acx-ui/store'
import { PathNode, NodesFilter } from '@acx-ui/utils'

interface KpiChangesParams {
  kpis: string[],
  path: PathNode[],
  beforeStart: string,
  beforeEnd: string,
  afterStart: string,
  afterEnd: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    configChange: build.query<
      ConfigChange[], { path: PathNode[], filter: NodesFilter, start: string, end: string }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          query ConfigChange(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
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
        [...response.network.hierarchyNode.configChanges
          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
          .map((value, id)=>({ ...value, id })),
        {
          key: 'initialState.ccmZone.version',
          name: 'Mesh-2_v70',
          newValues: ['7.0.0.0.479'],
          oldValues: ['7.0.0.0.446'],
          timestamp: '1691388744380',
          type: 'zone'
        },
        {
          key: 'initialState.CcmApSpecifics.radio5g.radio.channel',
          name: 'Mesh-2_v70',
          newValues: ['7.0.0.0.479'],
          oldValues: ['7.0.0.0.446'],
          timestamp: '1691398744380',
          type: 'ap'
        },
        {
          key: 'initialState.CcmApSpecifics.radio5g.radio.channel',
          name: 'Mesh-2_v70',
          newValues: ['7.0.0.0.479'],
          oldValues: ['7.0.0.0.446'],
          timestamp: '1691378744380',
          type: 'apGroup'
        },
        {
          key: 'initialState.ccmZone.version',
          name: 'Mesh-2_v70',
          newValues: ['7.0.0.0.479'],
          oldValues: ['7.0.0.0.446'],
          timestamp: '1691368744380',
          type: 'zone'
        }
        ]
    }),
    configChangeKPIChanges: build.query<
      { before: Record<string, number>, after: Record<string, number> },
      KpiChangesParams
    >({
      query: (variables) => ({
        variables: omit(variables, ['kpis']),
        document: gql`
          query ConfigChangeKPIChanges(
            $path: [HierarchyNodeInput],
            $beforeStart: DateTime, $beforeEnd: DateTime,
            $afterStart: DateTime, $afterEnd: DateTime,
            $filter: FilterInput
          ) {
              network(filter: $filter) {
                before: KPI(path: $path, start: $beforeStart, end: $beforeEnd) {
                  ${variables.kpis.join('\n')}
                }
                after: KPI(path: $path, start: $afterStart, end: $afterEnd) {
                  ${variables.kpis.join('\n')}
                }
              }
          }
        `
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

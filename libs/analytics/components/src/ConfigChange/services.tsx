import { gql } from 'graphql-request'

import type { ConfigChange }     from '@acx-ui/components'
import { dataApi }               from '@acx-ui/store'
import { PathNode, NodesFilter } from '@acx-ui/utils'

interface ConfigChangeResponse { configChanges: ConfigChange[] }
interface Response<T> { network: { hierarchyNode: T } }

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
      transformResponse: (response: Response<ConfigChangeResponse> ) =>
        response.network.hierarchyNode.configChanges.map((value, id)=>({ ...value, id }))
    })
  })
})

export const { useConfigChangeQuery } = api

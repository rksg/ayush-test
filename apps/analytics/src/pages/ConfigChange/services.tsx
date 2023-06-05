import { gql } from 'graphql-request'

import type { ConfigChange } from '@acx-ui/components'
import { dataApi }           from '@acx-ui/store'
import { PathNode }          from '@acx-ui/utils'

interface ConfigChangeResponse { configChanges: ConfigChange[] }
interface Response<T> { network: { hierarchyNode: T } }

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
      transformResponse: (response: Response<ConfigChangeResponse> ) =>
        response.network.hierarchyNode.configChanges
    })
  })
})

export const { useConfigChangeQuery } = api

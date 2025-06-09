import { gql } from 'graphql-request'

import { dataApi }                                     from '@acx-ui/store'
import type { AnalyticsFilter, PathNode, NetworkNode } from '@acx-ui/utils'

// R1
type NetworkData = PathNode & { id:string }
type NetworkHierarchyFilter = Omit<AnalyticsFilter, 'filter'> & {
  shouldQueryAp?: Boolean
  shouldQuerySwitch?: Boolean
  shouldQueryEdge?: Boolean
}
export type ApOrSwitch = {
  name: string
  mac: string
  serial?: string
  model?: string
  firmware?: string
}
export type FilterDevices = {
  aps?: ApOrSwitch[]
  switches?: ApOrSwitch[]
  edges?: Array<{ id: string, name: string }>
}
export type Child = NetworkData & FilterDevices
interface VenuesResponse { network: { venueHierarchy: Child[] } }

// RAI
interface HierarchyResponse {
  network: {
    apHierarchy: NetworkNode[]
    switchHierarchy: NetworkNode[]
  }
}
const mergeNodes = (children: NetworkNode[]): NetworkNode[] => {
  return Object.values(children.reduce((nodes, node) => {
    const key = node.type + node.name
    if (nodes[key]) {
      nodes[key].children!.push(...node.children!)
    } else {
      nodes[key] = node
    }
    return nodes
  }, {} as { [key: string]: NetworkNode }))
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    venuesHierarchy: build.query<Child[], NetworkHierarchyFilter>({
      query: payload => {
        const params = [
          ['queryAp', Boolean(payload.shouldQueryAp)],
          ['querySwitch', Boolean(payload.shouldQuerySwitch)],
          ['queryEdge', Boolean(payload.shouldQueryEdge)]
        ].filter(([, value]) => value).map(([key]) => `${key}: true`)
        return {
          document: gql`
            query VenueHierarchy($start: DateTime, $end: DateTime) {
              network(start: $start, end: $end) {
                venueHierarchy ${params.length ? `(${params.join(', ')})`: ''}
              }
            }
          `,
          variables: {
            start: payload.startDate,
            end: payload.endDate
          }
        }
      },
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_HIERARCHY' }],
      transformResponse: ({ network }: VenuesResponse) => network.venueHierarchy
    }),
    networkHierarchy: build.query<NetworkNode, NetworkHierarchyFilter>({
      query: payload => ({
        document: gql`
          query Network($start: DateTime, $end: DateTime) {
              network(start: $start, end: $end) {
                ${payload.shouldQueryAp ? 'apHierarchy' : ''}
                ${payload.shouldQuerySwitch ? 'switchHierarchy' : ''}
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_HIERARCHY' }],
      transformResponse: ({ network: { apHierarchy, switchHierarchy } }: HierarchyResponse) => ({
        name: 'Network',
        type: 'network',
        children: mergeNodes((apHierarchy || []).concat((switchHierarchy || [])))
          .map((system: NetworkNode): NetworkNode => ({
            ...system,
            children: mergeNodes(system.children!.reduce(
              (nodes, node) => nodes.concat(node.name === '1||Administration Domain'
                ? node.children!
                : [{ ...node, name: node.name.slice(3) }]
              ),
              [] as NetworkNode[]
            ))
          }))
      } as NetworkNode)
    })
  })
})

export const { useVenuesHierarchyQuery, useNetworkHierarchyQuery } = api

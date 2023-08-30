import { gql }                                           from 'graphql-request'
import { chain, cloneDeep, groupBy, mergeWith, isArray } from 'lodash'

import { AnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { dataApi }                             from '@acx-ui/store'
import { NetworkPath, NodeType, PathNode }     from '@acx-ui/utils'


type NetworkData = PathNode & { id:string, path: NetworkPath }
type NetworkHierarchyFilter = AnalyticsFilter & { shouldQuerySwitch? : Boolean }

export type ApOrSwitch = {
  path?: NetworkPath
  name: string
  mac: string
  serial?: string
  model?: string
  firmware?: string
}
export type ApsOrSwitches = { aps?: ApOrSwitch[], switches?: ApOrSwitch[] }
export type Child = NetworkData & ApsOrSwitches
interface Response {
  network: {
    hierarchyNode: { children: Child[] }
  }
}
type NetworkHierarchy<T> = T & { children?: NetworkHierarchy<T>[] }
interface NetworkNode extends NetworkHierarchy<Child>{}
interface HierarchyResponse {
  network: {
    apHierarchy: NetworkNode[]
    switchHierarchy: NetworkNode[]
  }
}
type HierarchyOutput<T> = T & { children?: Record<NodeType, T[]> }
interface HierarchyNode extends HierarchyOutput<NetworkNode> {}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkFilter: build.query<
      Child[],
      Omit<NetworkHierarchyFilter, 'filter'>
    >({
      query: payload => ({
        document: gql`
          query NetworkHierarchy(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $querySwitch: Boolean
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path, querySwitch: $querySwitch) {
                type
                name
                path {
                  type
                  name
                }
                children {
                  id
                  type
                  name
                  path {
                    type
                    name
                  }
                  aps {
                    name
                    mac
                  }
                  switches {
                    name
                    mac
                  }
                }
              }
            }
          }
        `,
        variables: {
          path: defaultNetworkPath,
          start: payload.startDate,
          end: payload.endDate,
          querySwitch: payload.shouldQuerySwitch
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_FILTER' }],
      transformResponse: (response: Response) =>
        response.network.hierarchyNode.children
    }),
    recentNetworkFilter: build.query<
      Child[],
      Omit<NetworkHierarchyFilter, 'filter'>
    >({
      query: payload => ({
        document: gql`
          query RecentNetworkHierarchy(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                type
                name
                path { type name }
                children {
                  id
                  type
                  name
                  path { type name }
                  aps: recentAps { name mac serial model firmware }
                }
              }
            }
          }
        `,
        variables: {
          path: defaultNetworkPath,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_RECENT_NETWORK_FILTER' }],
      transformResponse: (response: Response) => response.network.hierarchyNode.children
    }),
    networkHierarchy: build.query<
      NetworkNode,
      Omit<NetworkHierarchyFilter, 'filter'>
    >({
      query: payload => ({
        document: gql`
          query Network($start: DateTime, $end: DateTime) {
              network(start: $start, end: $end) {
                apHierarchy
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
      transformResponse: (response: HierarchyResponse) => {
        const { apHierarchy, switchHierarchy } = response.network || {}
        const aps = apHierarchy?.map(ap => explodeAdminDomain(ap)) || []
        const switches = switchHierarchy?.map(sw => explodeAdminDomain(sw)) || []
        return mergeApsAndSwitches(aps, switches)
      }
    })
  })
})

export const {
  useNetworkFilterQuery,
  useRecentNetworkFilterQuery,
  useNetworkHierarchyQuery
} = api

const cleanHierarchyName = (name: string) => {
  const transformDomainName = name.match(/^[1-9]\|\|/)
  if (transformDomainName) {
    return name.slice(3)
  }
  return name
}

const explodeAdminDomain = (origin: NetworkNode) => {
  const stack: NetworkNode[] = []
  const root: NetworkNode = cloneDeep(origin)
  stack.push(root)

  while (stack.length > 0) {
    let node = stack.pop() as NetworkNode
    const { name } = node
    const cleanName = cleanHierarchyName(name)
    let nameNode = { ...node, name: cleanName }
    node = Object.assign(node, nameNode)

    if (isArray(node.children) && node.children.length > 0) {
      // explode any nested children
      node.children = node.children.flat()
      const validChildren = node.children
        .map((child) => {
          const { name } = child
          return !name.startsWith('1||Administration Domain')
        })
      // explode children of administration domains to parent's sibling level
      const administrationIndex = validChildren.findIndex((val) => val === false)
      if (administrationIndex !== -1) {
        const adminDomain = node.children[administrationIndex]
        const adminChildren = adminDomain.children
        node.children.splice(administrationIndex, 1)
        if (adminChildren) {
          node.children = [...node.children, ...adminChildren]
        }
      }
      node.children.forEach((child) => stack.push(child))
    }
  }
  return root
}

const groupByHierarchyType = (node: NetworkNode): NetworkNode => {
  let { children } = node
  if (!children || children.length === 0) {
    return node as HierarchyNode
  }

  const groupedChildren = groupBy(
    children,
    (child) => child.type)

  const mergeNodeType = ['system' as const, 'domain' as const]
  for (let mergeNode of mergeNodeType) {
    if (mergeNode in groupedChildren) {
      // adapted from https://stackoverflow.com/a/47576800
      // to merge duplicated systems & domain across apsSystems & switchSystems
      groupedChildren[mergeNode] = chain(groupedChildren[mergeNode])
        .groupBy('name')
        .map((o) => mergeWith({}, ...o,
          (obj: NetworkNode[keyof NetworkNode], src: NetworkNode[keyof NetworkNode]) =>
            isArray(obj)
              ? (obj as NetworkNode[]).concat(src as NetworkNode[])
              : undefined
        ))
        .value()
    }
  }

  let finalChildren: NetworkNode[] = []
  Object.keys(groupedChildren).forEach((key) => {
    finalChildren = [...finalChildren, ...groupedChildren[key]]
  })
  const cleanedChildren = finalChildren.map(groupByHierarchyType)

  return {
    ...node,
    children: cleanedChildren
  }
}

const mergeApsAndSwitches = (
  apSystems: NetworkNode[],
  switchSystems: NetworkNode[]
) => {
  let systems: NetworkNode[] = apSystems.concat(switchSystems)
  const temp = {
    name: 'Network',
    type: 'network',
    children: systems
  } as NetworkNode
  return groupByHierarchyType(temp)
}

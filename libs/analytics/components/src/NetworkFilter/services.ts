import { gql }                                                            from 'graphql-request'
import { chain, cloneDeep, findIndex, omit, groupBy, mergeWith, isArray } from 'lodash'

import { AnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { dataApi }                             from '@acx-ui/store'
import { NetworkPath, PathNode }               from '@acx-ui/utils'


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
      HierarchyResponse,
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
      })
    })
  })
})

export const {
  useNetworkFilterQuery,
  useRecentNetworkFilterQuery
} = api

const { useNetworkHierarchyQuery } = api

export const useHierarchyQuery = (
  {
    filters,
    shouldQuerySwitch
  }: {
    filters: AnalyticsFilter,
    shouldQuerySwitch: boolean
  }
) => {
  const networkFilter = { ...filters, shouldQuerySwitch }

  const cleanHierarchyName = (name: string) => {
    const transformDomainName = name.match(/^[1-9]\|\|/)
    const validDomains = !name.startsWith('1||Administration Domain')
    if (transformDomainName) {
      const key = name.slice(3)
      return { key, validDomains }
    }
    return { key: name , validDomains }
  }


  const traverseHierarchy = (origin: NetworkNode) => {
    const stack: NetworkNode[] = []
    const root: NetworkNode = cloneDeep(origin)
    stack.push(root)

    while (stack.length > 0) {
      let node = stack.pop() as NetworkNode
      const { name } = node
      const { key } = cleanHierarchyName(name)
      let nameNode = { ...node, name: key }
      node = Object.assign(node, nameNode)

      if (node.children && node.children.length > 0) {
        node.children = node.children.flat()
        const validChildren = node.children
          .map((child) => {
            const { name } = child
            return cleanHierarchyName(name).validDomains
          })

        const invalidIndex = validChildren.findIndex((val) => val === false)
        if (invalidIndex !== -1) {
          const invalidChild = node.children[invalidIndex]
          const childrenInInvalidChild = invalidChild.children
          node.children.splice(invalidIndex, 1)
          if (childrenInInvalidChild) {
            node.children = [...node.children, ...childrenInInvalidChild]
          }
        }

        node.children.forEach((child) => stack.push(child))
      }
    }
    return root
  }

  const mergeApsAndSwitches = (apSystems: NetworkNode[], switchSystems: NetworkNode[]) => {
    let systems: NetworkNode[] = cloneDeep(apSystems)
    for (let sw of switchSystems) {
      const { name, type, children } = sw
      let index = findIndex(apSystems, (ap) => {
        return ap.name === name && ap.type === type
      })
      if (index !== -1) {
        const matchedSystem = apSystems[index]
        if (matchedSystem.children && children) {
          matchedSystem.children = [...matchedSystem.children, ...children]
          systems.splice(index, 1, matchedSystem)
        }
      } else {
        systems.push(sw)
      }
    }

    const groupByHierarchyType = (node: NetworkNode) => {
      let { children } = node
      if (!children || children.length === 0) {
        return node
      }

      const groupedNode = {
        ...node,
        children: groupBy(
          children,
          (child) => child.type)
      }

      if ('domain' in groupedNode.children) {
        groupedNode.children['domain'] = chain(groupedNode.children['domain'])
          .groupBy('name')
          .map((o) => mergeWith({}, ...o,
            (obj: NetworkNode[keyof NetworkNode], src: NetworkNode[keyof NetworkNode]) =>
              isArray(obj)
                ? (obj as Array<NetworkNode>).concat(src as Array<NetworkNode>)
                : undefined
          ))
          .value()
      }

      Object.keys(groupedNode.children).forEach((key) => {
        groupedNode.children[key] =
          groupedNode.children[key].map(groupByHierarchyType) as unknown as NetworkNode[]
      })
      return groupedNode
    }
    return systems.map(groupByHierarchyType)
  }

  const hierarchyQuery = useNetworkHierarchyQuery(omit(networkFilter, 'path', 'filter'),
    {
      selectFromResult: ({ data, ...rest }) => {
        const { apHierarchy, switchHierarchy } = data?.network || {}
        const aps = apHierarchy?.map(ap => traverseHierarchy(ap)) || []
        const switches = switchHierarchy?.map(sw => traverseHierarchy(sw)) || []
        return {
          ...rest,
          data: { network: mergeApsAndSwitches(aps, switches) } }
      }
    }
  )

  return hierarchyQuery
}

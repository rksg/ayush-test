import { gql }  from 'graphql-request'
import { omit } from 'lodash'

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
type NetworkHierarchy<T> = T & { children?: NetworkHierarchy<T>[], parentKey?: string[] }
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
    const transformDomain = name.match(/^[1-9]\|\|/)
    const validDomains = !name.includes('Administration Domain')
    if (transformDomain) {
      const key = name.slice(3)
      return { key, validDomains }
    }
    return { key: name , validDomains }
  }

  function appendNodeToStack (
    elem: NetworkNode | NetworkHierarchy<Child>[] | undefined,
    parentKey: string[] | undefined,
    key: string,
    stack: NetworkNode[]
  ): NetworkNode {
    const item = {
      ...elem,
      parentKey: parentKey
        ? [...parentKey, key, 'children']
        : [key, 'children']
    }
    stack.push(item! as NetworkNode)
    return item as unknown as NetworkNode
  }

  const traverseHierarchy = (origin: NetworkNode) => {
    const stack: NetworkNode[] = []
    const root: NetworkNode = JSON.parse(JSON.stringify(origin))
    stack.push(root)
    while (stack.length > 0) {
      let node = stack.pop() as NetworkNode
      const { name, parentKey } = node
      const { key } = cleanHierarchyName(name)
      let nameNode = { ...node, name: key }
      node = Object.assign(node, nameNode)

      if (node.children && node.children.length > 0) {
        const validChildren = node.children
          .map((child) => {
            const typedChild = child as unknown as NetworkNode[]
            if (typedChild.length && typedChild.length >= 0) {
              return true
            }
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

        function elemPushHelper (
          elem: NetworkNode
        ) {
          let typedNodes = elem as unknown as NetworkNode[]
          if (typedNodes.length > 0) {
            typedNodes= typedNodes.map((val) => {
              const item = appendNodeToStack(val, parentKey, key, stack)
              return item
            })
            return typedNodes
          }
          const item = appendNodeToStack(elem, parentKey, key, stack)
          return item
        }

        node.children = node.children.map(elemPushHelper).filter(Boolean) as NetworkNode[]
      }
    }
    return root
  }

  const hierarchyQuery = useNetworkHierarchyQuery(omit(networkFilter, 'path', 'filter'),
    {
      selectFromResult: ({ data, ...rest }) => {
        const { apHierarchy, switchHierarchy } = data?.network || {}
        const aps = apHierarchy?.map(ap => traverseHierarchy(ap))
        const switches = switchHierarchy?.map(sw => traverseHierarchy(sw))
        return {
          ...rest,
          data: { network: {
            apHierarchy: aps,
            switchHierarchy: switches
          } } }
      }
    }
  )

  return hierarchyQuery
}

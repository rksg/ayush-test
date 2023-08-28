import { gql }       from 'graphql-request'
import { omit, get } from 'lodash'

import { AnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { dataApi }                             from '@acx-ui/store'
import { NetworkPath, PathNode }               from '@acx-ui/utils'

import { IncidentTableRow, useIncidentsListQuery } from '../IncidentTable/services'

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
type IncidentHierarchy<T> = T & { children: IncidentHierarchy<T> | null }
type IncidentPriority = { P1: number, P2: number, P3: number, P4: number }
interface IncidentMap extends IncidentHierarchy<IncidentPriority>{}
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
    shouldQuerySwitch,
    includeIncidents
  }: {
    filters: AnalyticsFilter,
    shouldQuerySwitch: boolean,
    includeIncidents: boolean
  }
) => {
  const networkFilter = { ...filters, shouldQuerySwitch }

  const createIncidentNode = () => ({ P1: 0, P2: 0, P3: 0, P4: 0, children: null })
  const buildIncidentMap = (incidentList: IncidentTableRow[] | undefined) => {
    const mapper: Record<string, IncidentMap> = {}
    if (!incidentList) return mapper
    incidentList?.forEach(({ path, severityLabel, sliceType, sliceValue }) => {
      let currMapper = mapper
      let fullPath = [...path, { name: sliceValue, type: sliceType }]
      for (let { name } of fullPath) {
        if (!currMapper[name]) {
          currMapper[name] = createIncidentNode()
        }
        currMapper[name][severityLabel as keyof Omit<IncidentMap, 'children'>] += 1
        if (!currMapper[name].children) {
          currMapper[name].children =
              createIncidentNode() as unknown as IncidentHierarchy<IncidentPriority>
        }
        currMapper = currMapper[name].children as unknown as Record<string, IncidentMap>
      }
    })
    return mapper
  }
  const incidentQuery = useIncidentsListQuery(
    { ...filters, includeMuted: true },
    {
      skip: !includeIncidents,
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: buildIncidentMap(data)
      })
    })
  const incidentMap = incidentQuery.data

  const cleanHierarchyName = (name: string) => {
    const transformDomain = name.match(/^[1-9]\|\|/)
    const validDomains = !name.includes('Administration Domain')
    if (transformDomain) {
      const key = name.slice(3)
      return { key, validDomains }
    }
    return { key: name , validDomains }
  }

  const getIncidentMapKey = (key: string, parentKey?: string[]) => {
    if (!parentKey) return [key]
    return [...parentKey, key]
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

  const traverseHierarchy = (origin: NetworkNode, incidentMap: Record<string, IncidentMap>) => {
    const stack: NetworkNode[] = []
    const root: NetworkNode = JSON.parse(JSON.stringify(origin))
    stack.push(root)
    while (stack.length > 0) {
      let node = stack.pop() as NetworkNode
      const { name, parentKey } = node
      const { key } = cleanHierarchyName(name)
      let nameNode = { ...node, name: key }
      node = Object.assign(node, nameNode)
      if (includeIncidents && node) {
        const incidentsStats = get(incidentMap, getIncidentMapKey(key, parentKey))
        const newNode = {
          ...node,
          ...omit(incidentsStats, 'children'),
          name: key
        } as unknown as NetworkNode & IncidentPriority
        node = Object.assign(node, newNode)
      }
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
        const aps = apHierarchy?.map(ap => traverseHierarchy(ap, incidentMap))
        const switches = switchHierarchy?.map(sw => traverseHierarchy(sw, incidentMap))
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

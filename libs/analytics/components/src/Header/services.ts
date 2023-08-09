import { gql } from 'graphql-request'

import { getSelectedNodePath, normalizeNodeType } from '@acx-ui/analytics/utils'
import type { AnalyticsFilter }                   from '@acx-ui/analytics/utils'
import { dataApi }                                from '@acx-ui/store'
import { NetworkPath, NodeType, NodesFilter }     from '@acx-ui/utils'

import { HeaderData, SubTitle } from '.'

interface NetworkNodeInfo {
  name?: string,
  clientCount?: number,
  apCount?: number,
  switchCount?: number,
  mac?: string,
  model?: string[],
  internalIp?: string[],
  version?: string[],
  firmware?: string,
  portCount?: number,
}
interface Response <NetworkNodeInfo> {
  network: {
    node: NetworkNodeInfo
  }
}
type QueryVariables = {
  path?: NetworkPath
  startDate: string
  endDate: string
  mac?: string
  filter?: NodesFilter
}

type AttributesKey =
  | 'network'
  | 'zone'
  | 'switchGroup'
  | 'switchSubGroup'
  | 'apGroup'
  | 'switch'
  | 'AP'

const lowPreferenceList = ['0.0.0.0', '0', 'Unknown']

const getAttributesByNodeType = (nodeType: NodeType) => {
  const defaultAttributes = ['apCount', 'clientCount' ] as const
  const venueAttributes = [...defaultAttributes, 'switchCount']
  const attributes = {
    network: venueAttributes,
    zone: venueAttributes,
    apGroup: defaultAttributes,
    AP: [
      'model',
      'version',
      'mac',
      'internalIp',
      'clientCount'
    ] as const,
    switchGroup: venueAttributes,
    switchSubGroup: [
      'switchCount'
    ] as const,
    switch: [
      'model',
      'firmware',
      'portCount'
    ] as const
  }
  const key = normalizeNodeType(nodeType)
  return attributes[key as AttributesKey]
}

const getQuery = (filter: NodesFilter) : string => {
  const path = getSelectedNodePath(filter)
  const [{ type }] = path.slice(-1)
  switch (type) {
    case 'AP': return gql`
    query NetworkNodeInfo(
      $startDate: DateTime,
      $endDate: DateTime,
      $mac: String
      ){
        network(start: $startDate, end: $endDate) {
          node: ap(mac: $mac) {
            name
            ${getAttributesByNodeType(type).join('\n')}
          }
        }
      }`
    case 'switch': return gql`
      query NetworkNodeInfo(
        $path: [HierarchyNodeInput],
        $startDate: DateTime,
        $endDate: DateTime,
        $mac: String
      ){
        network(start: $startDate, end: $endDate) {
          node: switch(mac: $mac, path: $path) {
            name
            ${getAttributesByNodeType(type).join('\n')}
          }
        }
      }
    `
    default: return gql`
      query NetworkNodeInfo(
        $path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime, $filter: FilterInput
      ){
        network(start: $startDate, end: $endDate, filter: $filter) {
          node: hierarchyNode(path:$path) {
            ${getAttributesByNodeType(type).join('\n')}
          }
        }
      }
    `
  }
}

const getQueryVariables = (payload: AnalyticsFilter): QueryVariables => {
  const path = payload.filter.networkNodes?.[0].slice(-1)[0]
  switch(path?.type) {
    case 'apMac':
    case 'switch':
      return { ...payload, mac: path.list[0] }
    default:
      return payload
  }
}

const sortPreference = <T>(values: T | T[]): T[] => Array.isArray(values)
  ? [...values].sort(value => lowPreferenceList.includes(String(value)) ? 1 : -1)
  : [values]

export const transformForDisplay = (data: NetworkNodeInfo): HeaderData => {
  const { name, ...rest } = data
  const subTitle = Object.entries(rest)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      key: key as SubTitle['key'],
      value: sortPreference(value)
    }))
  return { name, subTitle }
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkNodeInfo: build.query<
      HeaderData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: getQuery(payload.filter),
        variables: getQueryVariables(payload)
      }),
      transformResponse:
        (response: Response<NetworkNodeInfo>): HeaderData =>
          transformForDisplay(response.network.node)
    })
  })
})

export const { useNetworkNodeInfoQuery } = api

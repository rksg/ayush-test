import { gql } from 'graphql-request'

import { dataApi }                            from '@acx-ui/analytics/services'
import { AnalyticsFilter, normalizeNodeType } from '@acx-ui/analytics/utils'
import {  NetworkPath, NodeType, pathFilter } from '@acx-ui/utils'

import { HeaderData, SubTitle } from '.'

interface NetworkNodeInfo {
  type: string,
  name: string,
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
  filter?: pathFilter
}

const lowPreferenceList = ['0.0.0.0', '0', 'Unknown']

const getAttributesByNodeType = (nodeType: NodeType) => {
  const defaultAttributes = ['type', 'apCount', 'clientCount' ] as const

  const attributes = {
    network: [...defaultAttributes, 'switchCount'] as const,
    zone: defaultAttributes,
    apGroup: defaultAttributes,
    AP: [
      'model',
      'version',
      'mac',
      'internalIp',
      'clientCount'
    ] as const,
    switchGroup: [
      'switchCount'
    ] as const,
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
  return attributes[key]
}

const getQuery = (path: NetworkPath) : string => {
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
            type: __typename
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
            type
            name
            ${getAttributesByNodeType(type).join('\n')}
          }
        }
      }
    `
    default: return gql`
      query NetworkNodeInfo(
        $path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime,
      ){
        network(start: $startDate, end: $endDate) {
          node: hierarchyNode(path:$path) {
            name
            ${getAttributesByNodeType(type).join('\n')}
          }
        }
      }
    `
  }
}

const getQueryVariables = (payload: AnalyticsFilter): QueryVariables => {
  const { path } = payload
  const [{ type, name }] = path.slice(-1)
  switch(type) {
    case 'AP':
    case 'switch': return { ...payload, mac: name }
    default:       return payload
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
      value: key === 'type'
        ? [String(value)]
        : sortPreference(value)
    }))
  return { title: name, subTitle }
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkNodeInfo: build.query<
      HeaderData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: getQuery(payload.path),
        variables: getQueryVariables(payload)
      }),
      transformResponse:
        (response: Response<NetworkNodeInfo>): HeaderData =>
          transformForDisplay(response.network.node)
    })
  })
})

export const { useNetworkNodeInfoQuery } = api

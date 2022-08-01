import { gql } from 'graphql-request'

import { useIntl } from 'react-intl'

import { dataApi }                                              from '@acx-ui/analytics/services'
import { GlobalFilter, NetworkPath, NetworkNodeTypeForDisplay } from '@acx-ui/analytics/utils'

import { HeaderData } from '.'

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
}
const labelMap = {
  type: 'Type',
  model: 'Model',
  firmware: 'Firmware',
  version: 'Firmware',
  mac: 'MAC Address',
  internalIp: 'IP Address',
  apCount: 'APs',
  clientCount: 'Clients',
  portCount: 'Ports',
  switchCount: 'Switches'
}

const lowPreferenceList = [
  '0.0.0.0', '0', 'Unknown'
]

const getAttributesByNodeType = (type: keyof typeof NetworkNodeTypeForDisplay): string[] => {
  const defaultAttributes = ['type', 'apCount', 'clientCount' ]
 
  const attributes = {
    network: [...defaultAttributes, 'switchCount'],
    zone: defaultAttributes,
    apGroup: defaultAttributes,
    AP: [
      'model',
      'version',            
      'mac',
      'internalIp',
      'clientCount'
    ],
    switchGroup: [
      'switchCount'
    ],
    switchSubGroup: [
      'switchCount'
    ],
    switch: [
      'model',
      'firmware',
      'portCount'
    ]
  }
  return attributes[type]
}

const getQuery = (path: NetworkPath) : string => {
  const [{ type }] = path.slice(-1)
  switch (type) {
    case 'AP':
      return gql`query NetworkNodeInfo($startDate: DateTime, $endDate: DateTime, $mac: String){
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
        $path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime
      ){
        network(start: $startDate, end: $endDate) {
          node: hierarchyNode(path:$path) {
            name
            ${getAttributesByNodeType(type as keyof typeof NetworkNodeTypeForDisplay).join('\n')}
          }
        }
      }
    `
  }
}

const getQueryVariables = (payload: GlobalFilter): QueryVariables => {
  const { path } = payload
  const [{ type, name }] = path.slice(-1)
  switch(type) {
    case 'AP': 
    case 'switch':
      return { ...payload, mac: name }
    default: return { ...payload }
  }
}

const sortPreference = (values: string | string[]): string[] => Array.isArray(values)
  ? [...values].sort(value => lowPreferenceList.includes(value) ? 1 : -1)
  : [values]

export const transformForDisplay = (data: NetworkNodeInfo): HeaderData => {
  const { name, ...rest } = data
  const subTitle = Object.entries(rest)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      key: labelMap[key as keyof typeof labelMap],
      value: key === 'type'
        ? [NetworkNodeTypeForDisplay[value as keyof typeof NetworkNodeTypeForDisplay]]
        : sortPreference(value)
    }))
  return { title: name, subTitle }
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkNodeInfo: build.query<
      HeaderData,
      GlobalFilter
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

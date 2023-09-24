import { gql }                              from 'graphql-request'
import _                                    from 'lodash'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'
import { dataApi }   from '@acx-ui/store'
import {
  NodeType,
  PathNode,
  AnalyticsFilter,
  PathFilter,
  NetworkPath
} from '@acx-ui/utils'

type TileMapType = {
  text: MessageDescriptor
  url: string,
  format: ReturnType<typeof formatter>,
}

export const tileMap: Record<string, TileMapType> = {
  apCount: {
    text: defineMessage({ defaultMessage: 'AP Count' }),
    url: '/reports/aps',
    format: formatter('countFormatRound')
  },
  clientCount: {
    text: defineMessage({ defaultMessage: 'Unique Clients' }),
    url: '/reports/clients',
    format: formatter('countFormatRound')
  },
  totalTraffic: {
    text: defineMessage({ defaultMessage: 'Traffic' }),
    url: '/reports/wireless',
    format: formatter('bytesFormat')
  },
  totalApplicationCount: {
    text: defineMessage({ defaultMessage: 'Applications' }),
    url: '/reports/applications',
    format: formatter('countFormatRound')
  },
  totalActiveWlanCount: {
    text: defineMessage({ defaultMessage: 'Active WLANs' }),
    url: '/reports/wlans',
    format: formatter('countFormatRound')
  },
  switchCount: {
    text: defineMessage({ defaultMessage: 'Switch Count' }),
    url: '/reports/switches',
    format: formatter('countFormatRound')
  },
  portCount: {
    text: defineMessage({ defaultMessage: 'Port Count' }),
    url: '/reports/switches',
    format: formatter('countFormatRound')
  },
  connectedWiredDevices: {
    text: defineMessage({ defaultMessage: 'Connected Wired Devices' }),
    url: '/reports/wired',
    format: formatter('countFormatRound')
  },
  poeUtilization: {
    text: defineMessage({ defaultMessage: 'POE Utilization' }),
    url: '/reports/wired',
    format: formatter('percentFormat')
  },
  switchTotalTraffic: {
    text: defineMessage({ defaultMessage: 'Wired Traffic' }),
    url: '/reports/wired',
    format: formatter('bytesFormat')
  }
}

const apSummaryAttributes = [
  'clientCount',
  'totalTraffic',
  'totalApplicationCount',
  'totalActiveWlanCount'
]

const switchSummaryAttributes = [
  'portCount',
  'connectedWiredDevices',
  'poeUtilization',
  'switchTotalTraffic'
]

export const getAttributes = (node?: PathNode) => {
  const defaultAttributes = ['type', 'clientCount', 'apCount']
  if(!node) return defaultAttributes

  const attributes: Record<Exclude<NodeType, 'controller'>, string[]> = {
    network: [...defaultAttributes, 'switchCount'],
    system: [
      'cluster: clusters',
      'szType: systemModels',
      'firmware: controllerVersion',
      'switchCount',
      ...defaultAttributes
    ],
    domain: [
      'zoneCount',
      'cluster: clusters',
      'switchGroupCount',
      ...defaultAttributes,
      'switchCount'
    ],
    zone: ['firmware: zoneFirmwares', 'cluster: clusters', ...defaultAttributes],
    apGroup: ['firmware: zoneFirmwares', ...defaultAttributes],
    AP: [
      'macAddress: mac',
      'model',
      'ipAddress: internalIp',
      'clientCount',
      'firmware: version'
    ],
    switchGroup: [ 'switchCount' ],
    switchSubGroup: [ 'switchCount' ],
    switch: [ 'model', 'firmware', 'mac', 'portCount' ]
  }
  return attributes[node.type as Exclude<NodeType, 'controller'>] || defaultAttributes
}

export const getSummaryAttributes = (node: PathNode) => {
  switch (node.type) {
    case 'network':
    case 'system':
    case 'domain':
    case 'zone':
    case 'apGroup':
      return ['apCount', ...apSummaryAttributes]
    case 'AP':
      return apSummaryAttributes
    case 'switchGroup':
    case 'switchSubGroup':
      return ['switchCount', ...switchSummaryAttributes]
    case 'switch':
      return switchSummaryAttributes
    default:
      return
  }
}

const getQuery = (attributes: string[]) => gql`
  query NetworkInfo($path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime)
  {
    network(start: $startDate, end: $endDate) {
      node: hierarchyNode(path:$path) {
        type
        name
        ${attributes.join('\n')}
      }
    }
  }
`

const getApQuery = (attributes: string[])=> gql`
  query NetworkInfo($startDate: DateTime, $endDate: DateTime, $mac: String)
  {
    network(start: $startDate, end: $endDate) {
      node: ap(mac: $mac) {
        type: __typename
        name
        ${attributes.join('\n')}
      }
    }
  }
`

const getSwitchQuery = (attributes: string[]) => gql`
  query NetworkInfo(
    $path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime, $mac: String
  )
  {
    network(start: $startDate, end: $endDate) {
      node: switch(mac: $mac, path: $path) {
        type
        name
        ${attributes.join('\n')}
      }
    }
  }
`

export const genNetworkSummaryInfoQuery = (
  { startDate, endDate, path }: PathFilter
) => {
  const [ node ] = path.slice(-1)
  const attributes = getSummaryAttributes(node) || getAttributes(node)

  let variables: Pick<AnalyticsFilter, 'startDate' | 'endDate' | 'mac'> & { path?: NetworkPath } =
    { startDate, endDate, path }
  let queryGenerator = getQuery
  if (node.type === 'AP') {
    const { path, ...rest } = variables
    variables = { ...rest, mac: node.name }
    queryGenerator = getApQuery
  }
  if (node.type === 'switch') {
    variables = { ...variables, mac: node.name }
    queryGenerator = getSwitchQuery
  }

  return { document: queryGenerator(attributes), variables }
}

type NetworkSummaryResponse = {
  network: { node: Record<string, string|number|null> }
}

type NetworkSummaryInfo = {
  key: string,
  value: string|number|null
} & Omit<TileMapType, 'format'>

export const { useNetworkSummaryInfoQuery } = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkSummaryInfo: build.query<NetworkSummaryInfo[], PathFilter>({
      query: (payload) => (genNetworkSummaryInfoQuery(payload)),
      transformResponse: (response: NetworkSummaryResponse) => Object.entries(response.network.node)
        .filter(([key]) => tileMap[key as keyof typeof tileMap])
        .map(([key, value]) => ({
          key,
          value,
          ...(_.omit(tileMap[key as keyof typeof tileMap], 'format'))
        }))
    })
  })
})

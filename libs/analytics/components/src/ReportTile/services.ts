import { gql }                              from 'graphql-request'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { formatter }          from '@acx-ui/formatter'
import { dataApi }            from '@acx-ui/store'
import { NodeType, PathNode } from '@acx-ui/utils'

type TileMapType = {
  text: MessageDescriptor
  url: string,
  format: ReturnType<typeof formatter>,
}

const tileMap: Record<string, TileMapType> = {
  apCount: {
    text: defineMessage({ defaultMessage: 'AP Count' }),
    url: '/reports/aps',
    format: formatter('countFormat')
  },
  clientCount: {
    text: defineMessage({ defaultMessage: 'Unique Clients' }),
    url: '/reports/clients',
    format: formatter('countFormat')
  },
  totalTraffic: {
    text: defineMessage({ defaultMessage: 'Traffic' }),
    url: '/reports/wireless',
    format: formatter('bytesFormat')
  },
  totalApplicationCount: {
    text: defineMessage({ defaultMessage: 'Applications' }),
    url: '/reports/applications',
    format: formatter('countFormat')
  },
  totalActiveWlanCount: {
    text: defineMessage({ defaultMessage: 'Active WLANs' }),
    url: '/reports/wlans',
    format: formatter('countFormat')
  },
  switchCount: {
    text: defineMessage({ defaultMessage: 'Switch Count' }),
    url: '/reports/switches',
    format: formatter('countFormat')
  },
  portCount: {
    text: defineMessage({ defaultMessage: 'Port Count' }),
    url: '/reports/switches',
    format: formatter('countFormat')
  },
  connectedWiredDevices: {
    text: defineMessage({ defaultMessage: 'Connected Wired Devices' }),
    url: '/reports/wired',
    format: formatter('countFormat')
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

const getAttributes = (node: PathNode) => {
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

const getSummaryAttributes = (node: PathNode) => {
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
      return null
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

type NetworkSummaryInfoProps = {
  startDate: string
  endDate: string
  path: PathNode[]
}

const genNetworkSummaryInfoQuery = ({ startDate, endDate, path }: NetworkSummaryInfoProps) => {
  const [ node ] = path.slice(-1)
  const attributes = getSummaryAttributes(node) || getAttributes(node)

  let variables: Omit<NetworkSummaryInfoProps, 'path'> & { mac?: string, path?: PathNode[] } =
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

const { useNetworkSummaryInfoQuery: fetchNetworkSummaryInfo } = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkSummaryInfo: build.query<
      ({ key: string, value: string|number|null } & TileMapType)[], NetworkSummaryInfoProps>({
        query: (payload) => (genNetworkSummaryInfoQuery(payload)),
        transformResponse: (
          response: { network: { node: Record<string, string|number|null> } }
        ) => Object.entries(response.network.node)
          .filter(([key]) => tileMap[key as keyof typeof tileMap])
          .map(([key, value]) => ({ key, value, ...tileMap[key as keyof typeof tileMap] }))
      })
  })
})

export function useNetworkSummaryInfoQuery (params: NetworkSummaryInfoProps) {
  return fetchNetworkSummaryInfo(params,
    { skip: params.path.length <= 0 } // TODO
  )
}

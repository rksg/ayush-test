import type { PathFilter, NetworkPath } from './types/networkFilter'

export const generateVenueFilter = (venueIds: string[]): PathFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})

export const generatePathFilter = (path: NetworkPath): PathFilter => {
  if (path.length === 1 && path[0].type === 'network') {
    return {}
  }

  const { type } = path[path.length - 1]
  switch (type) {
    case 'switch':
    case 'switchGroup':
      return {
        switchNodes: [path]
      }
    case 'AP':
    case 'ap':
    case 'apGroup':
    case 'apGroupName':
    case 'apMac':
    case 'zone':
      return {
        networkNodes: [path]
      }
    default:
      return {
        networkNodes: [path],
        switchNodes: [path]
      }
  }

}

export const getPathFromFilter = (filter: PathFilter): NetworkPath => {
  const { networkNodes, switchNodes } = filter
  const nodes = switchNodes || networkNodes
  return nodes && nodes.length
    ? nodes[0]
    : [{ type: 'network', name: 'Network' }]
}
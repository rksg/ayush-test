import type { PathFilter, NetworkPath } from './types/networkFilter'

export const generateVenueFilter = (venueIds: string[]): PathFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})

export const generatePathFilter: (path: NetworkPath) => PathFilter = (path: NetworkPath) => {
  if (path.length === 1 && path[0].type === 'network') {
    return {}
  }

  return {
    networkNodes: [path],
    switchNodes: [path]
  }
}

export function getPathFromFilter (filter: PathFilter, isSwitch?: boolean): NetworkPath {
  const { networkNodes, switchNodes } = filter
  const nodes = isSwitch ? switchNodes : networkNodes
  return nodes && nodes.length
    ? nodes[0]
    : [{ type: 'network', name: 'Network' }]
}
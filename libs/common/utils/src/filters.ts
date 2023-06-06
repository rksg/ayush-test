import type { PathFilter, NetworkPath } from './types/networkFilter'

export const generatePathFilter: (path: NetworkPath) => PathFilter = (path: NetworkPath) => {
  return {
    networkNodes: [path],
    switchNodes: [path]
  }
}

export const generateVenueFilter = (venueIds: string[]): PathFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})

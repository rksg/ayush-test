import type { NodesFilter } from './types/networkFilter'

export const generateVenueFilter = (venueIds: string[]): NodesFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})
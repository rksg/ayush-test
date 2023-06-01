import type { PathFilter } from './types/networkFilter'

export const generateVenueFilter = (venueIds: string[]): PathFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})

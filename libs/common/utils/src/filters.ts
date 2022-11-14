import { pathFilter } from './types/networkFilter'

export const generateVenueFilter = (venueIds: string[]): pathFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})

import type { NodesFilter, FilterNameNode } from './types/networkFilter'

export const generateVenueFilter = (venueIds: string[]): NodesFilter => ({
  networkNodes: venueIds.map(name => [{ type: 'zone', name }]),
  switchNodes: venueIds.map(name => [{ type: 'switchGroup', name }])
})

const noData4u: [[FilterNameNode]] = [[{ type: 'system', name: 'NODATA4U' }]]

export const emptyFilter = { networkNodes: noData4u, switchNodes: noData4u }

export const generateDomainFilter = (name: string): [FilterNameNode] => ([{
  type: 'domain', name
}])

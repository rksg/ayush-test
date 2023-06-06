import { generatePathFilter, getPathFromFilter } from './filters'

import type { NetworkPath, PathFilter } from './types/networkFilter'

describe('Filters test suit', () => {
  it('generatePathFilter: should return correct PathFilter', () => {
    const defaultFilter = generatePathFilter([{ type: 'network', name: 'Network' }])
    expect(defaultFilter).toMatchObject<PathFilter>({})

    const path: NetworkPath = [{ type: 'AP', name: 'test' }]
    const filter = generatePathFilter(path)
    expect(filter).toMatchObject<PathFilter>({
      networkNodes: [path],
      switchNodes: [path]
    })
  })

  it('getPathFromFilter: should return path from filter', () => {
    const filter: PathFilter = {
      networkNodes: [[{ type: 'ap', name: 'AP node' }]],
      switchNodes: [[{ type: 'switch', name: 'Switch node' }]]
    }
    const networkPath = getPathFromFilter(filter)
    expect(networkPath).toMatchObject<NetworkPath>(filter.networkNodes![0])
    const switchPath = getPathFromFilter(filter, true)
    expect(switchPath).toMatchObject<NetworkPath>(filter.switchNodes![0])
  })
})

import { generatePathFilter, getPathFromFilter } from './filters'

import type { NetworkPath, PathFilter } from './types/networkFilter'

describe('Filters test suit', () => {
  it('generatePathFilter: should return correct PathFilter', () => {
    const defaultFilter = generatePathFilter([{ type: 'network', name: 'Network' }])
    expect(defaultFilter).toMatchObject<PathFilter>({})

    const networkPath: NetworkPath = [{ type: 'AP', name: 'ap test' }]
    const networkFilter = generatePathFilter(networkPath)
    expect(networkFilter).toMatchObject<PathFilter>({
      networkNodes: [networkPath]
    })

    const switchPath: NetworkPath = [{ type: 'switch', name: 'switch test' }]
    const switchFilter = generatePathFilter(switchPath)
    expect(switchFilter).toMatchObject<PathFilter>({
      switchNodes: [switchPath]
    })
  })

  it('getPathFromFilter: should return path from filter', () => {
    const networkFilter: PathFilter = {
      networkNodes: [[{ type: 'ap', name: 'AP node' }]]
    }
    const networkPath = getPathFromFilter(networkFilter)
    expect(networkPath).toMatchObject<NetworkPath>(networkFilter.networkNodes![0])

    const switchFilter: PathFilter = {
      switchNodes: [[{ type: 'switch', name: 'Switch node' }]]
    }
    const switchPath = getPathFromFilter(switchFilter)
    expect(switchPath).toMatchObject<NetworkPath>(switchFilter.switchNodes![0])
  })
})

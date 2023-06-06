import { generatePathFilter } from './filters'

import type { PathFilter } from './types/networkFilter'

describe('Filters test suit', () => {
  it('should return correct PathFilter', () => {
    const pathFilter = generatePathFilter([{ type: 'network', name: 'Network' }])
    expect(pathFilter).toMatchObject<PathFilter>({
      networkNodes: [[{ type: 'network', name: 'Network' }]],
      switchNodes: [[{ type: 'network', name: 'Network' }]]
    })
  })
})
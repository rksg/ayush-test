import { get }          from '@acx-ui/config'
import { useIsSplitOn } from '@acx-ui/feature-toggle'

import { crrmStates }             from './config'
import { RecommendationListItem } from './services'
import { crrmStateSort }          from './Table'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
describe('crrmStateSort', () => {
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('') // get('IS_MLISA_SA')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('sorts by optimized state', () => {
    const itemA = { crrmOptimizedState: crrmStates.optimized } as RecommendationListItem
    const itemB = { crrmOptimizedState: crrmStates.nonOptimized } as RecommendationListItem
    expect(crrmStateSort(itemA, itemB)).toBe(-1)
    expect(crrmStateSort(itemB, itemA)).toBe(1)
    expect(crrmStateSort(itemB, itemB)).toBe(0)
  })
})

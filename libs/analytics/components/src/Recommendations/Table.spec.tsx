import { crrmStates }             from './config'
import { RecommendationListItem } from './services'
import { crrmStateSort }          from './Table'

describe('crrmStateSort', () => {
  it('sorts by optimized state', () => {
    const itemA = { crrmOptimizedState: crrmStates.optimized } as RecommendationListItem
    const itemB = { crrmOptimizedState: crrmStates.nonOptimized } as RecommendationListItem
    expect(crrmStateSort(itemA, itemB)).toBe(-1)
    expect(crrmStateSort(itemB, itemA)).toBe(1)
    expect(crrmStateSort(itemB, itemB)).toBe(0)
  })
})

import { RecommendationListItem } from './services'
import { rrmStateSort }           from './table'

describe('rrmStateSort', () => {
  it('sorts by optimized state', () => {
    const itemA = { statusEnum: 'applied' } as RecommendationListItem
    const itemB = { statusEnum: 'new' } as RecommendationListItem
    expect(rrmStateSort(itemA, itemB)).toBe(-1)
    expect(rrmStateSort(itemB, itemA)).toBe(1)
    expect(rrmStateSort(itemB, itemB)).toBe(0)
  })
})

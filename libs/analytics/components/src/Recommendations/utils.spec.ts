import { crrmListResult }                  from './__tests__/fixtures'
import { rrmStates }                       from './config'
import { transformCrrmList, CrrmListItem } from './services'
import {
  getOptimizedState,
  getCrrmLinkText
} from './utils'

describe('Recommendations utils', () => {
  const recommendations = transformCrrmList(
    crrmListResult.recommendations as unknown as CrrmListItem[])

  describe('getOptimizedState', () => {
    it('returns optimized state', () => {
      expect(getOptimizedState(recommendations[0].status)).toEqual(rrmStates.optimized)
    })

    it('returns non optimized state', () => {
      expect(getOptimizedState(recommendations[1].status)).toEqual(rrmStates.nonOptimized)
    })
  })

  describe('getCrrmLinkText', () => {
    it('returns optimized text', () => {
      expect(getCrrmLinkText(recommendations[0])).toBe('From 3 to 0 interfering links')
    })

    it('returns non-optimized text for new', () => {
      expect(getCrrmLinkText(recommendations[1])).toBe('5 interfering links can be optimized to 2')
    })

    it('returns non-optimized text for reverted', () => {
      expect(getCrrmLinkText(recommendations[2])).toBe('2 interfering links can be optimized to 0')
    })
  })
})

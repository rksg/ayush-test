import { crrmListResult }    from './__tests__/fixtures'
import { transformCrrmList } from './services'
import {
  isOptimized,
  getCrrmLinkText
} from './utils'

describe('Recommendations utils', () => {
  const recommendations = transformCrrmList(crrmListResult.recommendations)

  describe('isOptimized', () => {
    it('returns true if state is one where it is optimized', () => {
      expect(isOptimized(recommendations[0])).toBe(true)
    })

    it('returns false if state is one where it is not optimized', () => {
      expect(isOptimized(recommendations[1])).toBe(false)
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

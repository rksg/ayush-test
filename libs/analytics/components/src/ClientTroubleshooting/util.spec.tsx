import { getConnectionQualityFor, takeWorseQuality, getQualityColor } from './util'

describe('connectionQuality', () => {
  describe('getConnectionQuality', () => {
    it('returns correct values for rss', () => {
      const good = getConnectionQualityFor('rss', -10)
      expect(good).toMatch('good')

      const bad = getConnectionQualityFor('rss', -90)
      expect(bad).toMatch('bad')

      const average = getConnectionQualityFor('rss', -75)
      expect(average).toMatch('average')

      const nullVal = getConnectionQualityFor('rss', null)
      expect(nullVal).toBeNull()

      const undefinedVal = getConnectionQualityFor('rss', undefined)
      expect(undefinedVal).toBeNull()
    })

    it('returns correct values for snr', () => {
      const good = getConnectionQualityFor('snr', 20)
      expect(good).toMatch('good')

      const bad = getConnectionQualityFor('snr', 3)
      expect(bad).toMatch('bad')

      const average = getConnectionQualityFor('snr', 10)
      expect(average).toMatch('average')

      const nullVal = getConnectionQualityFor('snr', null)
      expect(nullVal).toBeNull()

      const undefinedVal = getConnectionQualityFor('snr', undefined)
      expect(undefinedVal).toBeNull()
    })

    it('returns correct values for throughput', () => {
      const good = getConnectionQualityFor('throughput', 3 * 1024)
      expect(good).toMatch('good')

      const bad = getConnectionQualityFor('throughput', 100)
      expect(bad).toMatch('bad')

      const average = getConnectionQualityFor('throughput', 1024)
      expect(average).toMatch('average')

      const nullVal = getConnectionQualityFor('throughput', null)
      expect(nullVal).toBeNull()

      const undefinedVal = getConnectionQualityFor('throughput', undefined)
      expect(undefinedVal).toBeNull()
    })

    it('returns correct values for avgTxMCS', () => {
      const good = getConnectionQualityFor('avgTxMCS', 40 * 1024)
      expect(good).toMatch('good')

      const bad = getConnectionQualityFor('avgTxMCS', 0)
      expect(bad).toMatch('bad')

      const average = getConnectionQualityFor('avgTxMCS', 15 * 1025)
      expect(average).toMatch('average')

      const nullVal = getConnectionQualityFor('avgTxMCS', null)
      expect(nullVal).toBeNull()

      const undefinedVal = getConnectionQualityFor('avgTxMCS', undefined)
      expect(undefinedVal).toBeNull()
    })
  })

  describe('takeWorseQuality', () => {
    it('returns correct worse quality', () => {
      const testQualities = ['good', 'good', 'average', 'bad']
      const worseQuality = takeWorseQuality(...testQualities)
      expect(worseQuality).toMatch('bad')
    })

    it('returns null on empty quality', () => {
      const emptyQuality = takeWorseQuality(...[])
      expect(emptyQuality).toBeNull()
    })
  })

  describe('getQualityColor', () => {
    it('return correct colors', () => {
      const bad = getQualityColor('bad')
      expect(bad).toMatch('--acx-semantics-red-50')

      const good = getQualityColor('good')
      expect(good).toMatch('--acx-semantics-green-50')

      const average = getQualityColor('average')
      expect(average).toMatch('--acx-neutrals-50')

      const unknown = getQualityColor('unknown')
      expect(unknown).toMatch('inherit')
    })
  })
})
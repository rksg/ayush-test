import { getIntl } from '@acx-ui/utils'

const mockGet = jest.fn()
jest.mock('@acx-ui/config', () => ({
  get: mockGet
}))

describe('codes', () => {
  describe('when IS_MLISA_SA is true', () => {
    jest.resetModules()
    mockGet.mockReturnValue('true')
    const { codes } = require('./index')
    for (let code in codes) {
      it(`should only have zone in the trade off text contents for ${code}`, () => {
        const { $t } = getIntl()
        expect($t(codes[code].tradeoffText)).toContain('zone')
        expect($t(codes[code].partialOptimizedTradeoffText)).toContain('zone')
        expect($t(codes[code].tradeoffText)).not.toContain('venue')
        expect($t(codes[code].partialOptimizedTradeoffText)).not.toContain('venue')
      })
    }
  })

  describe('when IS_MLISA_SA is empty', () => {
    jest.resetModules()
    mockGet.mockReturnValue('')
    const { codes } = require('./index')
    for (let code in codes) {
      it(`should only have venue in the trade off text contents for ${code}`, () => {
        const { $t } = getIntl()
        expect($t(codes[code].tradeoffText)).toContain('venue')
        expect($t(codes[code].partialOptimizedTradeoffText)).toContain('venue')
        expect($t(codes[code].tradeoffText)).not.toContain('zone')
        expect($t(codes[code].partialOptimizedTradeoffText)).not.toContain('zone')
      })
    }
  })
})

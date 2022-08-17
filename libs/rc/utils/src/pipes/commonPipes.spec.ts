import { transformDisplayText, transformDisplayNumber } from '.'

describe('Common pipes service', () => {
  it('should return value correctly', async () => {
    transformDisplayText('eMap')
    transformDisplayNumber(0)
  })
})
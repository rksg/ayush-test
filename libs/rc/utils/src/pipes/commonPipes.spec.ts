import { transformDisplayText, transformDisplayNumber } from './commonPipes'

describe('Common Pipes', () => {
  it('transformDisplayText : undefined value', async () => {
    const result = transformDisplayText()
    expect(result).toEqual('--')
  })

  it('transformDisplayNumber : undefined value', async () => {
    const result = transformDisplayNumber()
    expect(result).toEqual(0)
  })

})
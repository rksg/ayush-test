import { transformDisplayText, transformDisplayNumber, transformIPv6 } from './commonPipes'

describe('Common Pipes', () => {
  it('transformDisplayText : undefined value', async () => {
    const result = transformDisplayText()
    expect(result).toEqual('--')
  })

  it('transformDisplayNumber : undefined value', async () => {
    const result = transformDisplayNumber()
    expect(result).toEqual(0)
  })

  it('transformIPv6', async () => {
    expect(transformIPv6('ipv6')).toEqual('IPv6')
    expect(transformIPv6('IPv6')).toEqual('IPv6')
    expect(transformIPv6('IPV6')).toEqual('IPv6')

    expect(transformIPv6('ipv66')).toEqual('ipv66')
    expect(transformIPv6('ipv4')).toEqual('ipv4')
  })

})
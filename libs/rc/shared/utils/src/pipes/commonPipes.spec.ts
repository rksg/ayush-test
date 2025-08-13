import { transformDisplayText, transformDisplayNumber, transformIPv6, transformDisplayYesNo, transformDisplayOnOff, transformDisplayEnabledDisabled } from './commonPipes'

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

  describe('transformDisplayYesNo', () => {
    it('should return Yes when value is true', () => {
      expect(transformDisplayYesNo(true)).toEqual('Yes')
    })

    it('should return No when value is false', () => {
      expect(transformDisplayYesNo(false)).toEqual('No')
    })
  })

  describe('transformDisplayOnOff', () => {
    it('should return On when value is true', () => {
      expect(transformDisplayOnOff(true)).toEqual('On')
    })

    it('should return Off when value is false', () => {
      expect(transformDisplayOnOff(false)).toEqual('Off')
    })
  })

  describe('transformDisplayEnabledDisabled', () => {
    it('should return Enabled when value is true', () => {
      expect(transformDisplayEnabledDisabled(true)).toEqual('Enabled')
    })

    it('should return Disabled when value is false', () => {
      expect(transformDisplayEnabledDisabled(false)).toEqual('Disabled')
    })
  })
})
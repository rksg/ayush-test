import { extractSSIDFilter, useGetNetwork } from './services'

describe('extractSSIDFilter', () => {
  it('should return empty array', () => {
    const network = {} as ReturnType<typeof useGetNetwork>
    expect(extractSSIDFilter(network)).toEqual([])
  })
  it('should return ssid', () => {
    const network = {
      data: { wlan: { ssid: '1' } }
    } as ReturnType<typeof useGetNetwork>
    expect(extractSSIDFilter(network)).toEqual(['1'])
  })
})
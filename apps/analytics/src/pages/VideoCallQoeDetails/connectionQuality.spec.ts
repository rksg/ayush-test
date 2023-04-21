import { getConnectionQuality, getConnectionQualityFor, takeWorseQuality } from './connectionQuality'

describe('connectionQuality', () => {
  test('wifiMetrices having null', () => {
    const quality = getConnectionQuality({
      rss: null,
      snr: null,
      avgTxMCS: null,
      throughput: null
    })
    expect(quality).toBe(null)
  })
  test('takeWorseQuality with other qualities',()=>{
    const quality = takeWorseQuality(['nice','awesome','nice'])
    expect(quality).toBe('nice')
  })
  test('getConnectionQualityFor some unknown',()=>{
    const quality = getConnectionQualityFor('unknown',1000)
    expect(quality).toBe(null)
  })
})

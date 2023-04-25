import { getConnectionQuality, getConnectionQualityFor, getConnectionQualityTooltip, takeWorseQuality } from './connectionQuality'

describe('connectionQuality', () => {
  test('wifiMetrices having null', () => {
    const connectionQuality = {
      rss: null,
      snr: null,
      avgTxMCS: null,
      throughput: null
    }
    const quality = getConnectionQuality(connectionQuality)
    const tooltip = getConnectionQualityTooltip(connectionQuality)
    expect(quality).toBe(null)
    expect(tooltip).toMatchSnapshot()
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

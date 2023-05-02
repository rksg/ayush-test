import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { WifiMetrics } from '../VideoCallQoe/types'

import { getConnectionQuality, getConnectionQualityFor, getConnectionQualityTooltip, takeWorseQuality } from './helper'

describe('connectionQuality', () => {
  test('wifiMetrices having null', () => {
    const connectionQuality:WifiMetrics|null = {
      rss: null,
      snr: null,
      avgTxMCS: null,
      throughput: null
    }
    const quality = getConnectionQuality(connectionQuality)
    const { current: tooltip } = renderHook(()=>
      getConnectionQualityTooltip(connectionQuality, useIntl())).result
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

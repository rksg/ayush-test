import { SuspenseBoundary }                 from '@acx-ui/components'
import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM }                            from './AIDrivenRRM/__tests__/fixtures'
import { mocked as mockedCAclbEnable }                 from './AIOperations/__tests__/mockedCAclbEnable'
import { mocked as mockedCBandbalancingEnable }        from './AIOperations/__tests__/mockedCBandbalancingEnable'
import { mocked as mockedCBandbalancingEnableBelow61 } from './AIOperations/__tests__/mockedCBandbalancingEnableBelow61'
import { mocked as mockedCBandbalancingProactive }     from './AIOperations/__tests__/mockedCBandbalancingProactive'
import { mocked as mockedCBgScanEnable }               from './AIOperations/__tests__/mockedCBgScanEnable'
import { mocked as mockedCBgScanTimer }                from './AIOperations/__tests__/mockedCBgScanTimer'
import { mocked as mockedCDfschannelsDisable }         from './AIOperations/__tests__/mockedCDfschannelsDisable'
import { mocked as mockedCDfschannelsEnable }          from './AIOperations/__tests__/mockedCDfschannelsEnable'
import { mocked as mockedCTxpowerSame }                from './AIOperations/__tests__/mockedCTxpowerSame'
import {  mockedEtlFail }                              from './AIOperations/__tests__/mockedEtlFail'
import { mocked as mockedIZoneFirmwareUpgrade }        from './AIOperations/__tests__/mockedIZoneFirmwareUpgrade'
import { mockedIntentEcoFlex }                         from './EcoFlex/__tests__/fixtures'
import { mockedIntentEquiFlex }                        from './EquiFlex/__tests__/fixtures'
import { IntentDetail }                                from './useIntentDetailsQuery'

import { IntentAIDetails } from './index'

jest.mock('./AIDrivenRRM/CCrrmChannelAuto', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-crrm-channel-auto-IntentAIDetails'/>
}))

jest.mock('./AIOperations/IZoneFirmwareUpgrade', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='i-zonefirmware-upgrade-IntentAIDetails'/>
}))
jest.mock('./AIOperations/CTxpowerSame', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-txpower-same-IntentAIDetails'/>
}))
jest.mock('./AIOperations/CDfschannelsDisable', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-dfschannels-disable-IntentAIDetails'/>
}))
jest.mock('./AIOperations/CDfschannelsEnable', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-dfschannels-enable-IntentAIDetails'/>
}))
jest.mock('./AIOperations/CAclbEnable', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-aclb-enable-IntentAIDetails'/>
}))
jest.mock('./AIOperations/CBandbalancingProactive', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-bandbalancing-proactive-IntentAIDetails'/>
}))

jest.mock('./AIOperations/CBgScan24gEnable', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-bgscan24g-enable-IntentAIDetails'/>
}))

jest.mock('./AIOperations/CBgScan5gEnable', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-bgscan5g-enable-IntentAIDetails'/>
}))

jest.mock('./AIOperations/CBgScan24gTimer', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-bgscan24g-timer-IntentAIDetails'/>
}))

jest.mock('./AIOperations/CBgScan5gTimer', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-bgscan5g-timer-IntentAIDetails'/>
}))

jest.mock('./AIOperations/CBgScan6gTimer', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-bgscan6g-timer-IntentAIDetails'/>
}))

const doCRRMTest = async (codes: string[], intent: IntentDetail) => {
  for await (const code of codes) {
    const { unmount } = render(<SuspenseBoundary><IntentAIDetails /></SuspenseBoundary>, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(await screen.findByTestId('c-crrm-channel-auto-IntentAIDetails')).toBeVisible()
    unmount()
  }
}

jest.mock('./EquiFlex/CProbeFlex24g.tsx', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-probeflex-24g-IntentAIDetails'/>
}))
jest.mock('./EquiFlex/CProbeFlex5g.tsx', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-probeflex-5g-IntentAIDetails'/>
}))
jest.mock('./EquiFlex/CProbeFlex6g.tsx', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-probeflex-6g-IntentAIDetails'/>
}))

jest.mock('./EcoFlex/IEcoFlex.tsx', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='i-ecoflex-IntentAIDetails'/>
}))

const doTest = async (codes: string[], intent: IntentDetail) => {
  for await (const code of codes) {
    const { unmount } = render(<SuspenseBoundary><IntentAIDetails /></SuspenseBoundary>, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(await screen.findByTestId(`${code}-IntentAIDetails`)).toBeVisible()
    unmount()
  }
}
describe('IntentAIDetails', () => {
  it('should render for AIDrivenRRM', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedIntentCRRM } })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']
    await doCRRMTest(codes, mockedIntentCRRM)
  })
  const CBandbalancingEnable = () => require('./AIOperations/CBandbalancingEnable')

  describe('should render for AIOperations', () => {
    it('i-zonefirmware-upgrade', async () => {
      const intent = mockedIZoneFirmwareUpgrade
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      const codes = ['i-zonefirmware-upgrade']
      await doTest(codes, intent)
    })
    it('c-bgscan-enable', async () => {
      const intent = mockedCBgScanEnable
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      const codes = ['c-bgscan24g-enable', 'c-bgscan5g-enable']
      await doTest(codes, intent)
    })
    it('c-bgscan-timer', async () => {
      const intent = mockedCBgScanTimer
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      const codes = ['c-bgscan24g-timer', 'c-bgscan5g-timer', 'c-bgscan6g-timer']
      await doTest(codes, intent)
    })
    it('c-txpower-same', async () => {
      const intent = mockedCTxpowerSame
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-dfschannels-disable', async () => {
      const intent = mockedCDfschannelsDisable
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-dfschannels-enable', async () => {
      const intent = mockedCDfschannelsEnable
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-aclb-enable', async () => {
      const intent = mockedCAclbEnable
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-bandbalancing-enable', async () => {
      jest.spyOn(CBandbalancingEnable(), 'IntentAIDetails').mockImplementation(() => (
        <div data-testid='c-bandbalancing-enable-IntentAIDetails' />
      ))

      const intent = mockedCBandbalancingEnable
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-bandbalancing-enable-below-61', async () => {
      jest.spyOn(CBandbalancingEnable(), 'IntentAIDetails').mockImplementation(() => (
        <div data-testid='c-bandbalancing-enable-below-61-IntentAIDetails' />
      ))

      const intent = mockedCBandbalancingEnableBelow61
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-bandbalancing-proactive', async () => {
      const intent = mockedCBandbalancingProactive
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })

    it('c-bandbalancing-enable (druid error)', async () => {
      const intent = mockedCBandbalancingProactive
      mockGraphqlQuery(
        intentAIUrl,
        'IntentDetails',
        { error: { message: 'error' }, data: { intent: mockedEtlFail } })
      await doTest([intent.code], intent)
    })
  })

  it('should render for EquiFlex', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
      data: { intent: mockedIntentEquiFlex }
    })
    const codes = ['c-probeflex-24g', 'c-probeflex-5g', 'c-probeflex-6g']
    await doTest(codes, mockedIntentEquiFlex)
  })

  it('should render for EcoFlex', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
      data: { intent: mockedIntentEcoFlex }
    })
    const codes = ['i-ecoflex']
    await doTest(codes, mockedIntentEcoFlex)
  })
})

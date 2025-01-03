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
import { mocked as mockedIZoneFirmwareUpgrade }        from './AIOperations/__tests__/mockedIZoneFirmwareUpgrade'
import { mockedIntentEcoFlex }                         from './EcoFlex/__tests__/fixtures'
import { mockedIntentEquiFlex }                        from './EquiFlex/__tests__/fixtures'
import { IntentDetail }                                from './useIntentDetailsQuery'

import { IntentAIForm } from './index'

jest.mock('./AIDrivenRRM/CCrrmChannelAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel-auto-IntentAIForm'/>
}))

jest.mock('./AIOperations/IZoneFirmwareUpgrade', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='i-zonefirmware-upgrade-IntentAIForm'/>
}))
jest.mock('./AIOperations/CTxpowerSame', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-txpower-same-IntentAIForm'/>
}))
jest.mock('./AIOperations/CDfschannelsDisable', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-dfschannels-disable-IntentAIForm'/>
}))
jest.mock('./AIOperations/CDfschannelsEnable', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-dfschannels-enable-IntentAIForm'/>
}))
jest.mock('./AIOperations/CAclbEnable', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-aclb-enable-IntentAIForm'/>
}))
jest.mock('./AIOperations/CBandbalancingProactive', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-bandbalancing-proactive-IntentAIForm'/>
}))

jest.mock('./AIOperations/CBgScan24gEnable', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-bgscan24g-enable-IntentAIForm'/>
}))

jest.mock('./AIOperations/CBgScan5gEnable', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-bgscan5g-enable-IntentAIForm'/>
}))

jest.mock('./AIOperations/CBgScan24gTimer', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-bgscan24g-timer-IntentAIForm'/>
}))

jest.mock('./AIOperations/CBgScan5gTimer', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-bgscan5g-timer-IntentAIForm'/>
}))

jest.mock('./AIOperations/CBgScan6gTimer', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-bgscan6g-timer-IntentAIForm'/>
}))

jest.mock('./EquiFlex/CProbeFlex24g', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-probeflex-24g-IntentAIForm'/>
}))
jest.mock('./EquiFlex/CProbeFlex5g', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-probeflex-5g-IntentAIForm'/>
}))
jest.mock('./EquiFlex/CProbeFlex6g', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-probeflex-6g-IntentAIForm'/>
}))

jest.mock('./EcoFlex/IEcoFlex', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='i-ecoflex-IntentAIForm'/>
}))

const doCRRMTest = async (codes: string[], intent: IntentDetail) => {
  for await (const code of codes) {
    const { unmount } = render(<SuspenseBoundary><IntentAIForm /></SuspenseBoundary>, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(await screen.findByTestId('c-crrm-channel-auto-IntentAIForm')).toBeVisible()
    unmount()
  }
}

const doTest = async (codes: string[], intent: IntentDetail) => {
  for await (const code of codes) {
    const { unmount } = render(<SuspenseBoundary><IntentAIForm /></SuspenseBoundary>, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(await screen.findByTestId(`${code}-IntentAIForm`)).toBeVisible()
    unmount()
  }
}

describe('IntentAIForm', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedIntentCRRM } })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']
    await doCRRMTest(codes, mockedIntentCRRM)
  })

  describe('should render for AIOperations', () => {
    const CBandbalancingEnable = () => require('./AIOperations/CBandbalancingEnable')

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
      jest.spyOn(CBandbalancingEnable(), 'IntentAIForm').mockImplementation(() => (
        <div data-testid='c-bandbalancing-enable-IntentAIForm' />
      ))

      const intent = mockedCBandbalancingEnable
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })
      await doTest([intent.code], intent)
    })
    it('c-bandbalancing-enable-below-61', async () => {
      jest.spyOn(CBandbalancingEnable(), 'IntentAIForm').mockImplementation(() => (
        <div data-testid='c-bandbalancing-enable-below-61-IntentAIForm' />
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
  })

  it('should render for EquiFlex', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedIntentEquiFlex } })
    const codes = ['c-probeflex-24g', 'c-probeflex-5g', 'c-probeflex-6g']
    await doTest(codes, mockedIntentEquiFlex)
  })

  it('should render for EcoFlex', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedIntentEcoFlex } })
    const codes = ['i-ecoflex']
    await doTest(codes, mockedIntentEcoFlex)
  })
})

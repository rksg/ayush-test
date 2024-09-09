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
import { IntentAIForm }                                from './IntentAIForm'
import { Intent }                                      from './useIntentDetailsQuery'

jest.mock('./AIDrivenRRM/CCrrmChannel24gAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel24g-auto-IntentAIForm'/>
}))
jest.mock('./AIDrivenRRM/CCrrmChannel5gAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel5g-auto-IntentAIForm'/>
}))
jest.mock('./AIDrivenRRM/CCrrmChannel6gAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel6g-auto-IntentAIForm'/>
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

const doTest = async (codes: string[], intent: Intent) => {
  for (const code of codes) {
    const { unmount } = render(<IntentAIForm />, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(await screen.findByTestId(`${code}-IntentAIForm`)).toBeVisible()
    unmount()
  }
}

describe('IntentAIForm', () => {
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedIntentCRRM } })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']
    await doTest(codes, mockedIntentCRRM)
  })

  describe('should render for AIOperations', () => {
    const CBandbalancingEnable = () => require('./AIOperations/CBandbalancingEnable')
    const renderAIOperations = async (code: string) => {
      const { unmount } = render(<IntentAIForm />, {
        route: { params: { code } },
        wrapper: Provider
      })
      expect(await screen.findByTestId(`${code}-IntentAIForm`)).toBeVisible()
      unmount()
    }
    it('should render for IZoneFirmwareUpgrade', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedIZoneFirmwareUpgrade } })
      const codes = ['i-zonefirmware-upgrade']
      await doTest(codes, mockedIZoneFirmwareUpgrade)
    })
    it('should render for c-bgscan-enable', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedCBgScanEnable } })
      const codes = ['c-bgscan24g-enable', 'c-bgscan5g-enable']
      await doTest(codes, mockedCBgScanEnable)
    })
    it('should render for c-bgscan-timer', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedCBgScanTimer } })
      const codes = ['c-bgscan24g-timer', 'c-bgscan5g-timer', 'c-bgscan6g-timer']
      await doTest(codes, mockedCBgScanTimer)
    })
    it('should render for CTxpowerSame', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCTxpowerSame } })
      await renderAIOperations(mockedCTxpowerSame.code)
    })
    it('should render for CDfschannelsDisable', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCDfschannelsDisable } })
      await renderAIOperations(mockedCDfschannelsDisable.code)
    })
    it('should render for CDfschannelsEnable', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCDfschannelsEnable } })
      await renderAIOperations(mockedCDfschannelsEnable.code)
    })
    it('should render for CAclbEnable', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCAclbEnable } })
      await renderAIOperations(mockedCAclbEnable.code)
    })
    it('should render for CBandbalancingEnable', async () => {
      jest.spyOn(CBandbalancingEnable(), 'IntentAIForm').mockImplementation(() => (
        <div data-testid='c-bandbalancing-enable-IntentAIForm' />
      ))

      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCBandbalancingEnable } })
      await renderAIOperations(mockedCBandbalancingEnable.code)
    })
    it('should render for CBandbalancingEnableBelow61', async () => {
      jest.spyOn(CBandbalancingEnable(), 'IntentAIForm').mockImplementation(() => (
        <div data-testid='c-bandbalancing-enable-below-61-IntentAIForm' />
      ))

      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCBandbalancingEnableBelow61 } })
      await renderAIOperations(mockedCBandbalancingEnableBelow61.code)
    })
    it('should render for CBandbalancingProactive', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedCBandbalancingProactive } })
      await renderAIOperations(mockedCBandbalancingProactive.code)
    })
  })
})

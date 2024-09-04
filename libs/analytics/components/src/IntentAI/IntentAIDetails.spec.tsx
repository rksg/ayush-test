import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM }                     from './AIDrivenRRM/__tests__/fixtures'
import { mocked as mockedCBgScanEnable }        from './AIOperations/__tests__/mockedCBgScanEnable'
import { mocked as mockedCBgScanTimer }         from './AIOperations/__tests__/mockedCBgScanTimer'
import { mocked as mockedIZoneFirmwareUpgrade } from './AIOperations/__tests__/mockedIZoneFirmwareUpgrade'
import { IntentAIDetails }                      from './IntentAIDetails'
import { Intent }                               from './useIntentDetailsQuery'

jest.mock('./AIDrivenRRM/CCrrmChannel24gAuto', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-crrm-channel24g-auto-IntentAIDetails'/>
}))
jest.mock('./AIDrivenRRM/CCrrmChannel5gAuto', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-crrm-channel5g-auto-IntentAIDetails'/>
}))
jest.mock('./AIDrivenRRM/CCrrmChannel6gAuto', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-crrm-channel6g-auto-IntentAIDetails'/>
}))

jest.mock('./AIOperations/IZoneFirmwareUpgrade', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='i-zonefirmware-upgrade-IntentAIDetails'/>
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

const doTest = async (codes: string[], intent: Intent) => {
  for (const code of codes) {
    const { unmount } = render(<IntentAIDetails />, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(await screen.findByTestId(`${code}-IntentAIDetails`)).toBeVisible()
    unmount()
  }
}
describe('IntentAIDetails', () => {
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedIntentCRRM } })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']
    await doTest(codes, mockedIntentCRRM)
  })

  describe('should render for AIOperations', () => {
    it('should render for AIOperations', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedIZoneFirmwareUpgrade } })
      const codes = ['i-zonefirmware-upgrade']
      await doTest(codes, mockedIZoneFirmwareUpgrade)
    })
    it('c-bgscan-enable', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedCBgScanEnable } })
      const codes = ['c-bgscan24g-enable', 'c-bgscan5g-enable']
      await doTest(codes, mockedCBgScanEnable)
    })
    it('c-bgscan-timer', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: mockedCBgScanTimer } })
      const codes = ['c-bgscan24g-timer', 'c-bgscan5g-timer', 'c-bgscan6g-timer']
      await doTest(codes, mockedCBgScanTimer)
    })
    // TODO: add test for other AIOperations
  })
})

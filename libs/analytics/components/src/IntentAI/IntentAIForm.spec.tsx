import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM }                     from './AIDrivenRRM/__tests__/fixtures'
import { mocked as mockedCBgScanEnable }        from './AIOperations/__tests__/mockedCBgScanEnable'
import { mocked as mockedCBgScanTimer }         from './AIOperations/__tests__/mockedCBgScanTimer'
import { mocked as mockedIZoneFirmwareUpgrade } from './AIOperations/__tests__/mockedIZoneFirmwareUpgrade'
import { IntentAIForm }                         from './IntentAIForm'
import { Intent }                               from './useIntentDetailsQuery'

jest.mock('./AIDrivenRRM/CCrrmChannelAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel-auto-IntentAIForm'/>
}))

jest.mock('./AIOperations/IZoneFirmwareUpgrade', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='i-zonefirmware-upgrade-IntentAIForm'/>
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

const doCRRMTest = async (codes: string[], intent: Intent) => {
  for (const code of codes) {
    const { unmount } = render(<IntentAIForm />, {
      route: { params: { code, root: intent.root, sliceId: intent.sliceId } },
      wrapper: Provider
    })
    expect(await screen.findByTestId('c-crrm-channel-auto-IntentAIForm')).toBeVisible()
    unmount()
  }
}
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
    await doCRRMTest(codes, mockedIntentCRRM)
  })

  describe('should render for AIOperations', () => {
    it('i-zonefirmware-upgrade', async () => {
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

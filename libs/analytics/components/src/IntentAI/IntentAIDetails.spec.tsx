import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM }                     from './AIDrivenRRM/__tests__/fixtures'
import { mocked as mockedCDfschannelsDisable }  from './AIOperations/__tests__/mockedCDfschannelsDisable'
import { mocked as mockedCTxpowerSame }         from './AIOperations/__tests__/mockedCTxpowerSame'
import { mocked as mockedIZoneFirmwareUpgrade } from './AIOperations/__tests__/mockedIZoneFirmwareUpgrade'
import { IntentAIDetails }                      from './IntentAIDetails'

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
jest.mock('./AIOperations/CTxpowerSame', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-txpower-same-IntentAIDetails'/>
}))
jest.mock('./AIOperations/CDfschannelsDisable', () => ({
  kpis: [],
  IntentAIDetails: () => <div data-testid='c-dfschannels-disable-IntentAIDetails'/>
}))

describe('IntentAIDetails', () => {
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
      data: { intent: mockedIntentCRRM }
    })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']

    for (const code of codes) {
      const { unmount } = render(<IntentAIDetails />, {
        route: {
          params: {
            code,
            root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
            sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52'
          }
        },
        wrapper: Provider
      })
      expect(await screen.findByTestId(`${code}-IntentAIDetails`)).toBeVisible()
      unmount()
    }
  })

  describe('should render for AIOperations', () => {
    const renderAIOperations = async (code: string) => {
      const { unmount } = render(<IntentAIDetails />, {
        route: { params: { code } },
        wrapper: Provider
      })
      expect(await screen.findByTestId(`${code}-IntentAIDetails`)).toBeVisible()
      unmount()
    }
    it('should render for IZoneFirmwareUpgrade', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedIZoneFirmwareUpgrade } })
      await renderAIOperations(mockedIZoneFirmwareUpgrade.code)
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
  })
})

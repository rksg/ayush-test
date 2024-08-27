import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM } from './AIDrivenRRM/__tests__/fixtures'
import { IntentAIDetails }  from './IntentAIDetails'

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

describe('IntentAIDetails', () => {
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
      data: { intent: mockedIntentCRRM }
    })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']

    for (const code of codes) {
      const { unmount } = render(<IntentAIDetails />, {
        route: { params: { code } },
        wrapper: Provider
      })
      expect(await screen.findByTestId(`${code}-IntentAIDetails`)).toBeVisible()
      unmount()
    }
  })
})

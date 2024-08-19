import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM } from '../AIDrivenRRM/IntentAIDetails/__tests__/fixtures'

import { IntentAIForm } from '.'

jest.mock('../AIDrivenRRM', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='AIDrivenRRM-IntentAIForm'/>
}))

describe('IntentAIForm', () => {
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
      data: { intent: mockedIntentCRRM }
    })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']

    for (const code of codes) {
      const { unmount } = render(<IntentAIForm />, {
        route: { params: { code } },
        wrapper: Provider
      })
      expect(await screen.findByTestId('AIDrivenRRM-IntentAIForm')).toBeVisible()
      unmount()
    }
  })
})

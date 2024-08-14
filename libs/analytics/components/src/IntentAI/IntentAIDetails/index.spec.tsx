import { render, screen } from '@acx-ui/test-utils'

import { IntentAIDetails } from './index'

// TODO: should rename to IntentAIDetails
jest.mock('../AIDrivenRRM/IntentAIDetails/CrrmDetails', () => ({
  CrrmDetails: () => <div data-testid='crrm-details' />
}))

describe('IntentAIDetails', () => {
  it('should render for AIDrivenRRM', async () => {
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']

    for (const code of codes) {
      const { unmount } = render(<IntentAIDetails />, { route: { params: { code } } })
      expect(await screen.findByTestId('crrm-details')).toBeVisible()
      unmount()
    }
  })
})

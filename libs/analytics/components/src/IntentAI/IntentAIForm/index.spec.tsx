import { render, screen } from '@acx-ui/test-utils'

import { IntentAIForm } from '.'

jest.mock('../AIDrivenRRM/IntentAIForm', () => ({
  AIDrivenRRM: () => <div data-testid='AIDrivenRRM' />
}))

describe('IntentAIForm', () => {
  it('should render for AIDrivenRRM', async () => {
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']

    for (const code of codes) {
      const { unmount } = render(<IntentAIForm />, { route: { params: { code } } })
      expect(await screen.findByTestId('AIDrivenRRM')).toBeVisible()
      unmount()
    }
  })
})

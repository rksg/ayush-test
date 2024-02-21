import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@acx-ui/test-utils'

import { NetworkSegAuthModal } from './NetworkSegAuthModal'

jest.mock('../../../NetworkSegWebAuth/NetworkSegAuthForm', () => ({
  ...jest.requireActual('../../../NetworkSegWebAuth/NetworkSegAuthForm'),
  default: () => <div data-testid={'NetworkSegAuthForm'}></div>
}))

describe('NetworkSegAuthModel', () => {
  const setWebAuthTemplateId = jest.fn()
  it('Should render successfully', async () => {
    render(<NetworkSegAuthModal setWebAuthTemplateId={setWebAuthTemplateId} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    const form = await screen.findByTestId('NetworkSegAuthForm')
    await waitFor(() => expect(form).toBeVisible())

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(form).not.toBeVisible()
  })
})

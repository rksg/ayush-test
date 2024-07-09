import userEvent from '@testing-library/user-event'

import { render, screen }                 from '@acx-ui/test-utils'
import { WifiScopes }                     from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import { RogueApModal } from './RogueApModal'

jest.mock('./RogueAPDetectionForm/RogueAPDetectionForm', () => ({
  RogueAPDetectionForm: () => <div data-testid={'RogueApDetectionFromTestId'}></div>
}))

describe('RogueApModal', () => {
  it('should render RogueApModal successfully', async () => {
    render(<RogueApModal setPolicyId={jest.fn()}/>)
    await userEvent.click(await screen.findByRole('button', { name: /Add Profile/i }))
    const modalContent = await screen.findByTestId('RogueApDetectionFromTestId')
    expect(modalContent).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: /Cancel/i }))
    expect(modalContent).not.toBeVisible()
  })

  it('should render null if no permission', async () => {
    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      allowedOperations: [],
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ, WifiScopes.UPDATE]
    })

    const { container } = render(<RogueApModal setPolicyId={jest.fn()}/>)

    expect(container).toBeEmptyDOMElement()
  })
})

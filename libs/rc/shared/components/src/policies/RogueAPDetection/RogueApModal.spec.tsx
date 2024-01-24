import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

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
})

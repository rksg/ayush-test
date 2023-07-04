import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { Content } from './content'

describe('Input', () => {
  it('should render responsive content correctly', async () => {
    render(<Content setShowScreen={jest.fn()} />)
    const subOptimalButton = await screen.findByTestId('subOptimalButton')
    await userEvent.click(subOptimalButton)
  })
})

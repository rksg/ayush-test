import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ChatWithMelissa } from '.'

describe('ChatWithMelissa', () => {
  it('renders properly when chatbot enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<ChatWithMelissa />)
    fireEvent.click(await screen.findByRole('button'))
    expect(screen.getByText('Ask Anything')).toBeVisible()
  })
  it('should show coming soon when chatbot enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<ChatWithMelissa />)
    fireEvent.click(await screen.findByRole('button'))
    expect(screen.getByText('Coming Soon')).toBeVisible()
  })
})

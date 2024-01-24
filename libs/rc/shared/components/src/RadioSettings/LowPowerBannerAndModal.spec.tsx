import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { LowPowerBannerAndModal } from './LowPowerBannerAndModal'

describe('LowPowerBannerAndModal Unit Test', () => {
  it('Test Case for how to fix this button', () => {
    render(<LowPowerBannerAndModal />)
    const howToFixThisButton = screen.getByTestId('how-to-fix-this-button')
    expect(howToFixThisButton).toBeInTheDocument()
    fireEvent.click(howToFixThisButton)
    const instructionModal = screen.getByTestId('instruction-modal')
    expect(instructionModal).toBeInTheDocument()
    const okGotItButton = screen.getByTestId('ok-got-it-button')
    fireEvent.click(okGotItButton)
    expect(screen.queryByTestId('ok-got-it-button')).not.toBeVisible()
  })

  it('Test Case for AP Banner display', async () => {
    render(<LowPowerBannerAndModal />)
    expect(await screen.findByText('6 GHz radio operating in low power mode')).toBeInTheDocument()
  })

})

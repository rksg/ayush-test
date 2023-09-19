import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { LowPowerBannerAndModal } from './LowPowerBannerAndModal'

describe('LowPowerBannerAndModal Unit Test', () => {
  it('Test Case for how to fix this button', () => {
    render(<LowPowerBannerAndModal parent='ap' />)
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
    render(<LowPowerBannerAndModal parent='ap' />)
    expect(await screen.findByText('Degraded - AP in low power mode')).toBeInTheDocument()
  })

  it('Test Case for Venue Banner display', async () => {
    const testcase = { lowPowerAPCount: 10, allAPCount: 10 }
    render(<LowPowerBannerAndModal parent='venue'
      lowPowerAPs={testcase}
    />)
    /* eslint-disable max-len*/
    expect(await screen.findByText(
      'Access points that support 6 GHz are currently operating in low power mode'
      , { exact: false }
    )).toBeInTheDocument()
  })

  it('Test Case for Venue Banner not display if no ap', () => {
    render(<LowPowerBannerAndModal parent='venue' />)
    expect(screen.queryByTestId('low-power-banner')).not.toBeInTheDocument()
  })

  it('Test Case for Venue Banner not display context is ap', () => {
    render(<LowPowerBannerAndModal parent='venue' context='ap' />)
    expect(screen.queryByTestId('low-power-banner')).not.toBeInTheDocument()
  })

  it('Test Case for Venue Banner not display context 0 ap is low power mode', () => {
    render(<LowPowerBannerAndModal parent='venue'
      lowPowerAPs={{ lowPowerAPCount: 0, allAPCount: 10 }}
    />)
    expect(screen.queryByTestId('low-power-banner')).not.toBeInTheDocument()
  })
})

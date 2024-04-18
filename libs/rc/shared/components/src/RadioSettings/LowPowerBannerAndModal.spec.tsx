import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { LowPowerBannerAndModal } from './LowPowerBannerAndModal'

describe('LowPowerBannerAndModal Unit Test', () => {
  const mockNavigate = jest.fn()
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
  }))

  const params = { tenantId: 't1', venueId: 'v1' }

  it('Test Case for how to fix this button', () => {

    render(<LowPowerBannerAndModal from={'ap'} />, { route: { params }, wrapper: Provider })
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
    render(<LowPowerBannerAndModal from={'ap'} />, { route: { params }, wrapper: Provider })
    // eslint-disable-next-line
    expect(await screen.findByText('6 GHz radio operating in Low Power Indoor Mode.')).toBeInTheDocument()
  })

  it('Test Case for Venue Banner display', async () => {
    render(<LowPowerBannerAndModal from={'venue'} />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('AFC in the 6 GHz band requires ' +
    'a venue height to be set for standard power operation.')).toBeInTheDocument()
  })

})

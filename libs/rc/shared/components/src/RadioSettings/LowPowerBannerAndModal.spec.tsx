import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { LowPowerBannerAndModal } from './LowPowerBannerAndModal'

describe('LowPowerBannerAndModal Unit Test', () => {
  const mockNavigate = jest.fn()
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
  }))

  const params = { tenantId: 't1', venueId: 'v1' }

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

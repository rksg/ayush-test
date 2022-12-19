import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import { mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import handlers  from './__tests__/fixtures'
import PoolTable from './PoolTable'

describe('Venue DHCP Instance', () => {
  it('should render DHCP instance correctly', async () => {
    mockServer.use(...handlers)

    const params = { tenantId: 'ddebd42a937047baa51cab5fbe2537ea',
      venueId: '07c99ef9e17a401d981043e0ea378c2a' }
    const { asFragment } = render(<Provider><PoolTable /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/services' }
    })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(asFragment()).toMatchSnapshot()
  })

})

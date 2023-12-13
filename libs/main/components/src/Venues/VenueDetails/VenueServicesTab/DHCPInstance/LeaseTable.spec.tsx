import '@testing-library/jest-dom'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import handlers        from './__tests__/fixtures'
import VenueLeaseTable from './LeaseTable'


describe('Venue Lease Table', () => {
  it('should render Lease Table instance correctly', async () => {
    mockServer.use(...handlers)

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    // eslint-disable-next-line react/jsx-no-undef
    render(<Provider><VenueLeaseTable /></Provider>, {
      route: { params }
    })

    expect(await screen.findByText('MAC Address')).toBeVisible()
  })

})

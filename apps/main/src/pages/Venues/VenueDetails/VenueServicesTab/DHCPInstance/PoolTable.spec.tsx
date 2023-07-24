import '@testing-library/jest-dom'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import handlers       from './__tests__/fixtures'
import VenuePoolTable from './PoolTable'


describe('Venue Pool Table', () => {
  it('should render Pool Table instance correctly', async () => {
    mockServer.use(...handlers)

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    // eslint-disable-next-line react/jsx-no-undef
    render(<Provider><VenuePoolTable /></Provider>, {
      route: { params }
    })

    expect(await screen.findByText('Subnet Mask')).toBeVisible()
  })

})

import '@testing-library/jest-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { handlers }    from './__tests__/fixtures'
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

  it('should call rbac apis and render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      ...handlers
    )

    const params = { tenantId: 'tenant-id', venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4' }
    render(<Provider><VenueLeaseTable /></Provider>, {
      route: { params }
    })

    expect(await screen.findAllByText('d6:51:9f:5c:d6:a2')).toHaveLength(2)
    expect(screen.getByText('192.168.1.43')).toBeVisible()
    expect(screen.getByText('Online')).toBeVisible()
    expect(screen.getByText('fff')).toBeVisible()
  })
})

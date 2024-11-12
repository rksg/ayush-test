import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider }                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen, waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { handlers }   from './__tests__/fixtures'
import VenuePoolTable from './PoolTable'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  UsageRate: () => <div data-testid='usageRate-testid'>UsageRate</div>
}))

describe('Venue Pool Table', () => {
  it('should render Pool Table instance correctly', async () => {
    mockServer.use(...handlers)

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    // eslint-disable-next-line react/jsx-no-undef
    render(<Provider><VenuePoolTable /></Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Subnet Mask')).toBeVisible()

    await screen.findByText(/dhcppool#1/i)

    const button = screen.getAllByRole('switch')
    await userEvent.click(button[1])
    let activeButton = await screen.findByText('Confirm')
    await userEvent.click(activeButton)

    await userEvent.click(button[0])
    activeButton = await screen.findByText('Confirm')
    await userEvent.click(activeButton)
  })
})

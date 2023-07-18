import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import { mockServer,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import handlers from './__tests__/fixtures'

import DHCPInstance from '.'


describe.skip('Venue DHCP Instance', () => {
  it('should render DHCP instance correctly', async () => {
    mockServer.use(...handlers)

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    render(<Provider><DHCPInstance /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/services' }
    })

    await screen.findByText('abcd')
    const buttonmanage = screen.getByRole('button', { name: 'Manage Local Service' })
    await userEvent.click(buttonmanage)
    await new Promise((r)=>{setTimeout(r, 500)})
    await userEvent.click(screen.getByRole('button', { name: 'Add gateway' }))

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await userEvent.click(screen.getByRole('button', { name: 'Manage Local Service' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    const button = screen.getAllByRole('switch')
    await userEvent.click(button[1])
    let activeButton = await screen.findByText('Confirm')
    fireEvent.click(activeButton)

    await userEvent.click(button[0])
    activeButton = await screen.findByText('Confirm')
    fireEvent.click(activeButton)


    await userEvent.click(screen.getByRole('radio', { name: 'Lease Table (1 Online)' }))
  })

})

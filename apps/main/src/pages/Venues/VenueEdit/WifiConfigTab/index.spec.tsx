import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { WifiConfigTab } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('WifiConfigTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><WifiConfigTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByRole('tab', { name: 'Radio' })
    await screen.findByRole('tab', { name: 'Networking' })
    await screen.findByRole('tab', { name: 'Security' })
    await screen.findByRole('tab', { name: 'External Servers' })
    await screen.findByRole('tab', { name: 'Advanced Settings' })
  })
})

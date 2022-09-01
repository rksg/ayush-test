import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { SwitchConfigTab } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('SwitchConfigTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><SwitchConfigTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByRole('tab', { name: 'General' })
    await screen.findByRole('tab', { name: 'AAA' })
    await screen.findByRole('tab', { name: 'Configuration History' })
    await screen.findByRole('tab', { name: 'Routed Interfaces' })
  })
})

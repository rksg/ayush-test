import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltConfigurationTab } from './'

describe('OltConfigurationTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OltConfigurationTab />
    </Provider>, { route: { params } })

    expect(screen.getByText('OltConfigurationTab')).toBeInTheDocument()
  })

})

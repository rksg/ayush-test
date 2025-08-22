import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltOntTab } from './'

describe('OltOntTab', () => {
  const params = {
    tenantId: 'tenant-id', venueId: 'venue-id', oltId: 'olt-id', activeTab: 'onts'
  }

  it('should render correctly', async () => {
    render(<Provider>
      <OltOntTab />
    </Provider>, { route: { params } })

    expect(screen.getByText('OltOntTab')).toBeInTheDocument()
  })

})

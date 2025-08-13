import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntOverviewTab } from '.'

describe('OntOverviewTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OntOverviewTab />
    </Provider>, { route: { params } })

    expect(screen.getByText('OntOverviewTab')).toBeInTheDocument()
  })

})

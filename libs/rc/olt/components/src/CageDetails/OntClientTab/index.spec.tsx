import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntClientTab } from '.'

describe('OntClientTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OntClientTab />
    </Provider>, { route: { params } })

    expect(screen.getByText('OntClientTab')).toBeInTheDocument()
  })

})

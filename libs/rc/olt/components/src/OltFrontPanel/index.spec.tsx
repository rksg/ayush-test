import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltFrontPanel } from './'

const { mockOlt } = OltFixtures

describe('OltFrontPanel', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OltFrontPanel
        oltDetails={mockOlt}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('MF-2')).toBeInTheDocument()
  })

})

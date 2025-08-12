import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { EditOntDrawer } from './'

describe('EditOntDrawer', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <EditOntDrawer
        visible={true}
        onClose={jest.fn()}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Edit ONT')).toBeInTheDocument()
  })

})

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntDetailsDrawer } from './'

const { mockOntList } = OltFixtures

describe('OntDetailsDrawer', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OntDetailsDrawer
        visible={true}
        ontDetails={mockOntList[0]}
        onClose={jest.fn()}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('ONT Details')).toBeInTheDocument()
  })

})

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntInfoWidget } from './'

const { mockOntList } = OltFixtures

describe('OntInfoWidget', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OntInfoWidget
        ontDetails={mockOntList[0]}
        isLoading={false}
        isFetching={false}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('OntInfoWidget')).toBeInTheDocument()
  })

})

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntOverviewTab } from '.'

const { mockOntList } = OltFixtures

describe('OntOverviewTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OntOverviewTab data={mockOntList[0].portDetails} />
    </Provider>, { route: { params } })

    expect(screen.getAllByTestId('unit')).toHaveLength(mockOntList[0].portDetails.length)
    expect(screen.getByText('01')).toBeInTheDocument()
  })

})

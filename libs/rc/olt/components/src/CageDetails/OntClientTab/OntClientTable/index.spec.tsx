import { OltOntClient, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }                  from '@acx-ui/store'
import { screen, render }            from '@acx-ui/test-utils'

import { OntClientTable } from './'

const { mockOntList } = OltFixtures

describe('OntClientTable', () => {
  const mockClientList = mockOntList[0].clientDetails as OltOntClient[]

  it('should render correctly', () => {
    const props = {
      data: mockClientList
    }
    render(<Provider>
      <OntClientTable {...props} />
    </Provider>)
    expect(screen.getByRole('row', { name: /ont_1_client 00:00:00:00:00:00 1/ })).toBeVisible()
  })

  it('should render without data correctly', () => {
    const props = {
      data: []
    }
    render(<Provider>
      <OntClientTable {...props} />
    </Provider>)
    expect(screen.getByText('Hostname')).toBeInTheDocument()
  })

})
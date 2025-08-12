import { OltOntPort, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }                from '@acx-ui/store'
import { screen, render }          from '@acx-ui/test-utils'

import { OntPortTable } from './'

const { mockOlt, mockOntList } = OltFixtures

describe('OntPortTable', () => {
  const mockPortList = mockOntList[0].portDetails as OltOntPort[]

  it('should render correctly', () => {
    const props = {
      data: mockPortList
    }
    render(<Provider>
      <OntPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    screen.getByRole('row', { name: /1 Up 5% \(2.5 \/ 50 W\)/ })
    screen.getByRole('row', { name: /2 Down 20% \(10 \/ 50 W\)/ })
    expect(screen.getByRole('row', { name: /3 Up 6% \(3 \/ 50 W\)/ })).toBeVisible()
  })

  it('should render with empty data correctly', () => {
    const props = {
      data: [],
      oltDetails: mockOlt
    }
    render(<Provider>
      <OntPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

})
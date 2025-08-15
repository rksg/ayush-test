import userEvent from '@testing-library/user-event'

import { OltOntPort, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }                from '@acx-ui/store'
import { screen, render }          from '@acx-ui/test-utils'

import { OntPortTable } from '.'

jest.mock('../EditOntPortDrawer', () => ({
  EditOntPortDrawer: () => <div data-testid='EditOntPortDrawer' />
}))

const { mockOlt, mockOntList } = OltFixtures

describe('OntPortTable', () => {
  const mockPortList = mockOntList[0].portDetails as OltOntPort[]

  it('should render correctly', async () => {
    const props = {
      data: mockPortList
    }
    render(<Provider>
      <OntPortTable {...props} />
    </Provider>)
    expect(screen.getByRole('row', { name: /3 Up 6% \(3 \/ 50 W\)/ })).toBeVisible()
  })

  it('should open edit drawer when edit button is clicked', async () => {
    const props = {
      data: mockPortList
    }
    render(<Provider>
      <OntPortTable {...props} />
    </Provider>)

    expect(screen.getByRole('row', { name: /3 Up 6% \(3 \/ 50 W\)/ })).toBeVisible()
    await userEvent.click(screen.getByRole('row', { name: /3 Up 6% \(3 \/ 50 W\)/ }))
    await userEvent.click(screen.getByText('Edit'))
    expect(screen.getByTestId('EditOntPortDrawer')).toBeInTheDocument()
  })

  it('should render with empty data correctly', async () => {
    const props = {
      data: [],
      oltDetails: mockOlt
    }
    render(<Provider>
      <OntPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeInTheDocument()
  })

})
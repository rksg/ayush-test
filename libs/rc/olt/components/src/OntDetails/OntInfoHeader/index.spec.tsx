import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntInfoHeader } from '.'

const mockedDispatch = jest.fn()
const { mockOntList } = OltFixtures

describe('OntInfoHeader', () => {
  const params = {
    tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id',
    cageId: 'cage-id', activeTab: 'panel'
  }
  it('should render correctly', async () => {
    render(<Provider>
      <OntInfoHeader
        ontDetails={mockOntList[0]}
        dispatch={mockedDispatch}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('ont_1')).toBeInTheDocument()
    expect(screen.getByText('ONT Details')).toBeInTheDocument()
    expect(screen.getByText('Edit ONT')).toBeInTheDocument()
  })

  it('should open edit ont drawer', async () => {
    render(<Provider>
      <OntInfoHeader
        ontDetails={mockOntList[0]}
        dispatch={mockedDispatch}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('ont_1')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Edit ONT'))
    expect(mockedDispatch).toHaveBeenCalledWith({ type: 'OPEN_DRAWER', payload: 'editOnt' })
  })

  it('should open ont details drawer', async () => {
    render(<Provider>
      <OntInfoHeader
        ontDetails={mockOntList[0]}
        dispatch={mockedDispatch}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('ont_1')).toBeInTheDocument()
    await userEvent.click(screen.getByText('ONT Details'))
    expect(mockedDispatch).toHaveBeenCalledWith({ type: 'OPEN_DRAWER', payload: 'ontDetails' })
  })
})

import userEvent from '@testing-library/user-event'

import { Olt, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'

import { OltDetailsDrawer } from '.'

const { mockOlt } = OltFixtures
const setVisible = jest.fn()

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('OltDetailsDrawer', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id' }
  const mockPath = '/:tenantId/devices/optical/:venueId/:oltId/details'
  const defaultProps = {
    visible: true,
    setVisible: setVisible,
    oltDetails: mockOlt as Olt
  }

  beforeEach(() => {
    setVisible.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <OltDetailsDrawer {...defaultProps} />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    expect(screen.getByText('Network Card 1')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Line Card'))
    expect(screen.getByText('PON Line Card 1')).toBeInTheDocument()
  })

  it('should close drawer correctly', async () => {
    const defaultProps = {
      visible: true,
      setVisible: setVisible,
      oltDetails: {
        ...mockOlt,
        venueId: ''
      } as Olt
    }

    render(<Provider>
      <OltDetailsDrawer {...defaultProps} />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toBeCalled()
  })

})
import userEvent from '@testing-library/user-event'

import { Olt, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'

import { OltDetailsDrawer } from '.'

const { mockOlt } = OltFixtures
describe('OltDetailsDrawer', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const defaultProps = {
    visible: true,
    setVisible: jest.fn(),
    currentOlt: mockOlt as Olt
  }

  it('should render with valid props', async () => {
    render(<Provider>
      <OltDetailsDrawer {...defaultProps} />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    expect(screen.getByText('Network Card 1')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Line Card'))
    expect(screen.getByText('PON Line Card 1')).toBeInTheDocument()
  })

})
import { Olt, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'

import { OltDetailsDrawer } from '.'

const { mockOlt } = OltFixtures
describe('OltDetailsDrawer', () => { //TODO
  const params = { tenantId: 'mock-tenant-id', oltId: 'mock-olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'

  const defaultProps = {
    visible: true,
    setVisible: jest.fn(),
    currentOlt: mockOlt as Olt
  }

  it('renders with valid props', () => {
    render(<Provider>
      <OltDetailsDrawer {...defaultProps} />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    expect(screen.getByText('PON Line Card 1')).toBeInTheDocument()
  })

})
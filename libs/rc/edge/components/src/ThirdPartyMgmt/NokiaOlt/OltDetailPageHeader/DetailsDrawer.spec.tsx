import  userEvent from '@testing-library/user-event'

import { EdgeNokiaOltData, EdgeNokiaOltStatusEnum, EdgeOltFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import { render, screen }                                            from '@acx-ui/test-utils'

import { OltDetailsDrawer } from './DetailsDrawer'

const { mockOlt } = EdgeOltFixtures
describe('OltDetailsDrawer', () => {
  const params = { tenantId: 'mock-tenant-id', oltId: 'mock-olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'

  const defaultProps = {
    visible: true,
    setVisible: jest.fn(),
    currentOlt: mockOlt as EdgeNokiaOltData
  }

  it('renders with valid props', () => {
    render(<Provider>
      <OltDetailsDrawer {...defaultProps} />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('134.242.136.112')).toBeInTheDocument()
    expect(screen.getByText('Vendor')).toBeInTheDocument()
    expect(screen.getByText('Nokia')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('MF-2')).toBeInTheDocument()
    expect(screen.getByText('Firmware Version')).toBeInTheDocument()
    expect(screen.getByText('22.649')).toBeInTheDocument()
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('Mock Venue 1')).toBeInTheDocument()
    expect(screen.getByText('RUCKUS Edge')).toBeInTheDocument()
    expect(screen.getByText('Edge Cluster 1')).toBeInTheDocument()
  })

  it('renders with invalid props (missing currentOlt)', () => {
    render(<Provider>
      <OltDetailsDrawer {...defaultProps} currentOlt={undefined} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('Vendor')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('Firmware Version')).toBeInTheDocument()
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('RUCKUS Edge')).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(7)
  })

  it('calls onClose function when closed', async () => {
    render(<Provider>
      <OltDetailsDrawer {...defaultProps} />
    </Provider>, { route: { params, path: mockPath } })
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)
    expect(defaultProps.setVisible).toHaveBeenCalledTimes(1)
    expect(defaultProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('renders content with invalid currentOlt data (missing properties)', () => {
    const props = {
      ...defaultProps,
      currentOlt: {
        status: EdgeNokiaOltStatusEnum.ONLINE,
        ip: '192.168.1.1'
      }
    }
    render(<Provider>
      <OltDetailsDrawer {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(6)
  })

  it('renders -- when not online', () => {
    const props = {
      ...defaultProps,
      currentOlt: {
        ...mockOlt,
        status: EdgeNokiaOltStatusEnum.OFFLINE
      }
    }
    render(<Provider>
      <OltDetailsDrawer {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('Mock Venue 1')).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(6)
  })
})
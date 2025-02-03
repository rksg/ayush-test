import { render, screen } from '@acx-ui/test-utils'

import { OltDetailsDrawer } from './DetailsDrawer'

describe('OltDetailsDrawer', () => {
  const defaultProps = {
    visible: true,
    setVisible: jest.fn(),
    currentOlt: {
      ip: '192.168.1.1',
      vendor: 'Nokia',
      model: 'OLT-123',
      firmware: '1.2.3',
      venueId: 'venue-123',
      venueName: 'Venue 123',
      edgeClusterId: 'edge-cluster-123',
      edgeClusterName: 'Edge Cluster 123'
    }
  }

  it('renders with valid props', () => {
    render(<OltDetailsDrawer {...defaultProps} />)
    expect(screen.getByText('Optical Details')).toBeInTheDocument()
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
    expect(screen.getByText('Vendor')).toBeInTheDocument()
    expect(screen.getByText('Nokia')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('OLT-123')).toBeInTheDocument()
    expect(screen.getByText('Firmware Version')).toBeInTheDocument()
    expect(screen.getByText('1.2.3')).toBeInTheDocument()
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('Venue 123')).toBeInTheDocument()
    expect(screen.getByText('RUCKUS Edge')).toBeInTheDocument()
    expect(screen.getByText('Edge Cluster 123')).toBeInTheDocument()
  })

  it('renders with invalid props (missing visible)', () => {
    const props = { ...defaultProps, visible: undefined }
    render(<OltDetailsDrawer {...props} /> )
    expect(screen.queryByText('Optical Details')).toBeNull()
  })

  it('renders with invalid props (missing setVisible)', () => {
    const props = { ...defaultProps, setVisible: undefined }
    render(<OltDetailsDrawer {...props} /> )
    expect(screen.queryByText('Optical Details')).toBeNull()
  })

  it('renders with invalid props (missing currentOlt)', () => {
    const props = { ...defaultProps, currentOlt: undefined }
    render(<OltDetailsDrawer {...props} />)
    expect(screen.queryByText('Optical Details')).toBeNull()
  })

  it('calls onClose function when closed', async () => {
    const props = { ...defaultProps }
    render(<OltDetailsDrawer {...props} />)
    const closeButton = screen.getByText('Close')
    await userEvent.click(closeButton)
    expect(props.setVisible).toHaveBeenCalledTimes(1)
    expect(props.setVisible).toHaveBeenCalledWith(false)
  })

  it('renders content with valid currentOlt data', () => {
    const props = { ...defaultProps }
    render(<OltDetailsDrawer {...props} />)
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
    expect(screen.getByText('Vendor')).toBeInTheDocument()
    expect(screen.getByText('Nokia')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('OLT-123')).toBeInTheDocument()
    expect(screen.getByText('Firmware Version')).toBeInTheDocument()
    expect(screen.getByText('1.2.3')).toBeInTheDocument()
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('Venue 123')).toBeInTheDocument()
    expect(screen.getByText('RUCKUS Edge')).toBeInTheDocument()
    expect(screen.getByText('Edge Cluster 123')).toBeInTheDocument()
  })

  it('renders content with invalid currentOlt data (missing properties)', () => {
    const props = {
      ...defaultProps,
      currentOlt: {
        ip: '192.168.1.1'
      }
    }
    render(<OltDetailsDrawer {...props} />)
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(5)
  })
})
import { EdgeMultiWanConfigStats }   from '@acx-ui/rc/utils'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { EdgeWanLinkHealthDetailsDrawer } from './index'

describe('EdgeWanLinkHealthDetailsDrawer', () => {
  const mockSetVisible = jest.fn()

  const mockHealthCheckPolicy: EdgeMultiWanConfigStats = {
    serialNumber: 'mock-edge-node-id',
    edgeClusterId: 'mock-cluster-id',
    multiWanPolicyId: 'mock-policy-id',
    portName: 'port1',
    priority: 2,
    linkHealthMonitorEnabled: true,
    monitorProtocol: 'PING',
    monitorTargets: ['192.168.1.1', '192.168.1.2'],
    monitorLinkDownCriteria: 'ALL_TARGETS_DOWN',
    monitorIntervalSec: 5,
    monitorMaxCountToDown: 3,
    monitorMaxCountToUp: 2
  }

  it('renders with all health check policy details', () => {
    render(
      <EdgeWanLinkHealthDetailsDrawer
        visible={true}
        setVisible={mockSetVisible}
        portName='port1'
        data={mockHealthCheckPolicy}
      />
    )

    expect(screen.getByText('Port1: Link Health Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Protocol')).toBeInTheDocument()
    expect(screen.getByText('ICMP (Ping)')).toBeInTheDocument()
    expect(screen.getByText('Target IP Addresses')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.2')).toBeInTheDocument()
    expect(screen.getByText('Test Failure Condition')).toBeInTheDocument()
    expect(screen.getByText('All targets were unreachable')).toBeInTheDocument()
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
    expect(screen.getByText('5 Seconds')).toBeInTheDocument()
    expect(screen.getByText('Mark Link as DOWN after...')).toBeInTheDocument()
    expect(screen.getByText('3 Tries')).toBeInTheDocument()
    expect(screen.getByText('Mark Link as UP after...')).toBeInTheDocument()
    expect(screen.getByText('2 Tries')).toBeInTheDocument()
  })

  it('renders with missing health check policy details', () => {
    render(
      <EdgeWanLinkHealthDetailsDrawer
        visible={true}
        setVisible={mockSetVisible}
        portName='Port2'
        data={undefined}
      />
    )

    expect(screen.getByText('Port2: Link Health Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Protocol')).toBeInTheDocument()
    expect(screen.queryByText('ICMP (Ping)')).not.toBeInTheDocument()
    expect(screen.getByText('Target IP Addresses')).toBeInTheDocument()
    expect(screen.queryByText('192.168.1.1')).not.toBeInTheDocument()
    expect(screen.getByText('Test Failure Condition')).toBeInTheDocument()
    expect(screen.queryByText('All targets were unreachable')).not.toBeInTheDocument()
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
    expect(screen.queryByText('5 Seconds')).not.toBeInTheDocument()
    expect(screen.getByText('Mark Link as DOWN after...')).toBeInTheDocument()
    expect(screen.queryByText('3 Tries')).not.toBeInTheDocument()
    expect(screen.getByText('Mark Link as UP after...')).toBeInTheDocument()
    expect(screen.queryByText('2 Tries')).not.toBeInTheDocument()
  })

  it('calls setVisible on close', () => {
    render(
      <EdgeWanLinkHealthDetailsDrawer
        visible={true}
        setVisible={mockSetVisible}
        portName='Port3'
        data={mockHealthCheckPolicy}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockSetVisible).toHaveBeenCalledWith(undefined)
  })

  it('does not render when visible is false', () => {
    render(
      <EdgeWanLinkHealthDetailsDrawer
        visible={false}
        setVisible={mockSetVisible}
        portName='Port4'
        data={mockHealthCheckPolicy}
      />
    )

    expect(screen.queryByText('Port4: Link Health Monitoring')).not.toBeInTheDocument()
  })
})

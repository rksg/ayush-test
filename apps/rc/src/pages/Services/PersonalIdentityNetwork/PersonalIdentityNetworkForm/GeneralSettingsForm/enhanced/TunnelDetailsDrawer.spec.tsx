import userEvent from '@testing-library/user-event'

import { EdgeTunnelProfileFixtures } from '@acx-ui/rc/utils'
import { render, screen, within }    from '@acx-ui/test-utils'

import { TunnelDetailsDrawer } from './TunnelDetailsDrawer'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures

describe('TunnelDetailsDrawer', () => {
  it('should render correctly', async () => {
    render(<TunnelDetailsDrawer data={mockedTunnelProfileViewData.data[0]} />)

    await userEvent.click(screen.getByRole('button', { name: 'Tunnel details' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Tunnel Details: tunnelProfile1')).toBeVisible()
    expect(within(dialog).getByText('AP to Cluster Settings')).toBeVisible()
    expect(within(dialog).getByText('Destination RUCKUS Edge cluster')).toBeVisible()
    expect(within(dialog).getByText('EdgeCluster1')).toBeVisible()
    expect(within(dialog).getByText('Network Segment Type')).toBeVisible()
    expect(within(dialog).getByText('VNI')).toBeVisible()
    expect(within(dialog).getByText('Gateway Path MTU Mode')).toBeVisible()
    expect(within(dialog).getByText('Manual (1450)')).toBeVisible()
    expect(within(dialog).getByText('Force Fragmentation')).toBeVisible()
    expect(within(dialog).getByText('ON')).toBeVisible()
    expect(within(dialog).getByText('Idle Period')).toBeVisible()
    expect(within(dialog).getByText('20 minutes')).toBeVisible()
    expect(within(dialog).getByText('Tunnel Keep Alive Interval')).toBeVisible()
    expect(within(dialog).getByText('1000 seconds')).toBeVisible()
    expect(within(dialog).getByText('Tunnel Keep Alive Retries')).toBeVisible()
    expect(within(dialog).getByText('1 retries')).toBeVisible()
  })
})

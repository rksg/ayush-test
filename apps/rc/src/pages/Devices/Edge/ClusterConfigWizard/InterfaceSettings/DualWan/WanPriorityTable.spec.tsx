import userEvent from '@testing-library/user-event'

import { EdgeWanLinkHealthCheckPolicy, EdgeWanMember } from '@acx-ui/rc/utils'
import { render, screen, within }                      from '@acx-ui/test-utils'

import { WanPriorityTable } from './WanPriorityTable'

jest.mock('./LinkHealthMonitorToggleButton', () => ({
  LinkHealthMonitorToggleButton: (props: {
      portName: string
      enabled: boolean,
      // eslint-disable-next-line max-len
      onChange:(checked: boolean, healthCheckData: EdgeWanLinkHealthCheckPolicy | undefined) => Promise<void>
    }) =>
    <div data-testid='LinkHealthMonitorToggleButton'>
      <span>Port Name: {props.portName}</span>
      <span>Enabled: {props.enabled}</span>
      <button onClick={() => props.onChange(!props.enabled, undefined)}>Toggle</button>
    </div>
}))

describe('WanPriorityTable', () => {
  const defaultProps = {
    data: [
      { priority: 1, serialNumber: 'node1_sn', portName: 'port1', healthCheckEnabled: true },
      { priority: 2, serialNumber: 'node2_sn', portName: 'port1', healthCheckEnabled: false }
    ] as EdgeWanMember[],
    onChange: jest.fn(),
    nodeNameMapping: { node1_sn: 'Node 1', node2_sn: 'Node 2' }
  }

  it('should render the table with the correct columns and data', () => {
    render(<WanPriorityTable {...defaultProps} />)
    expect(screen.getByRole('columnheader', { name: 'Port' })).toBeInTheDocument()
    expect(screen.getByText('Node 1 / port1')).toBeInTheDocument()
    expect(screen.getByText('Node 2 / port1')).toBeInTheDocument()
  })

  it('should toggle health check when the toggle button is clicked', async () => {
    render(<WanPriorityTable {...defaultProps} />)
    const targetRow = screen.getByRole('row', { name: /Node 1/ })
    await userEvent.click(within(targetRow).getByText('Toggle'))
    expect(defaultProps.onChange).toHaveBeenCalledWith([
      { ...defaultProps.data[0], healthCheckEnabled: false },
      { ...defaultProps.data[1] }
    ])
  })
})
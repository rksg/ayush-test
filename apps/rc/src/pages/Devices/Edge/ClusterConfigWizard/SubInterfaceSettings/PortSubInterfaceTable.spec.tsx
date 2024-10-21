import { render, screen } from '@acx-ui/test-utils'

import { PortSubInterfaceTable } from './PortSubInterfaceTable'
import { SubInterfaceTable }     from './SubInterfaceTable'


jest.mock('./SubInterfaceTable', () => ({
  SubInterfaceTable: jest.fn(() => <div>Mocked SubInterfaceTable</div>)
}))

describe('PortSubInterfaceTable', () => {
  const mockProps = {
    serialNumber: '12345',
    currentTab: 'tab1',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5E',
    portId: '0'
  }

  it('should render SubInterfaceTable with correct props', () => {
    render(<PortSubInterfaceTable {...mockProps} />)

    expect(screen.getByText('Mocked SubInterfaceTable')).toBeInTheDocument()
    expect(SubInterfaceTable).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockProps,
        namePath: ['portSubInterfaces', mockProps.serialNumber, mockProps.portId]
      }),
      expect.anything()
    )
  })
})

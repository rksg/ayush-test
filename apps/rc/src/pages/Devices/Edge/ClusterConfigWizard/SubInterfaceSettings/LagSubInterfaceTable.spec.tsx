import { render, screen } from '@acx-ui/test-utils'

import { LagSubInterfaceTable } from './LagSubInterfaceTable'
import { SubInterfaceTable }    from './SubInterfaceTable'


jest.mock('./SubInterfaceTable', () => ({
  SubInterfaceTable: jest.fn(() => <div>Mocked SubInterfaceTable</div>)
}))

describe('LagSubInterfaceTable', () => {
  const mockProps = {
    serialNumber: '12345',
    currentTab: 'tab1',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5E',
    lagId: '0'
  }

  it('should render SubInterfaceTable with correct props', () => {
    render(<LagSubInterfaceTable {...mockProps} />)

    expect(screen.getByText('Mocked SubInterfaceTable')).toBeInTheDocument()
    expect(SubInterfaceTable).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockProps,
        namePath: ['lagSubInterfaces', mockProps.serialNumber, mockProps.lagId]
      }),
      expect.anything()
    )
  })
})

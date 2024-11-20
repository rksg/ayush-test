import userEvent from '@testing-library/user-event'

import { EdgeGeneralFixtures, EdgeStatus } from '@acx-ui/rc/utils'
import { render, screen }                  from '@acx-ui/test-utils'

import { mockVipConfig, mockVipInterfaces } from './__tests__/fixtures'
import { InterfaceTable }                   from './InterfaceTable'

const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('./SelectInterfaceDrawer', () => ({
  ...jest.requireActual('./SelectInterfaceDrawer'),
  SelectInterfaceDrawer: ({ handleFinish }: {
    handleFinish: (data: { serialNumber: string; portName: string; }[]) => void
  }) => <div data-testid='SelectInterfaceDrawer'>
    <button
      onClick={() => handleFinish(mockVipConfig[0].interfaces)}
    >
      Select Port
    </button>
  </div>
}))

describe('InterfaceTable', () => {
  it('should render InterfaceTable successfully', async () => {
    render(
      <InterfaceTable
        value={mockVipConfig[0].interfaces}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
      />
    )

    expect(screen.getByTestId('SelectInterfaceDrawer')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 1 Port2 192.168.13.136/ 24' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 2 Port2 192.168.13.134/ 24' })).toBeVisible()
  })

  it('should render "Dynamic" when ip mode is DHCP', async () => {
    render(
      <InterfaceTable
        value={[
          mockVipConfig[0].interfaces[0],
          {
            ...mockVipConfig[0].interfaces[1],
            portName: 'lag0'
          }
        ]}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
      />
    )

    expect(screen.getByTestId('SelectInterfaceDrawer')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 1 Port2 192.168.13.136/ 24' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Smart Edge 2 Lag0 Dynamic' })).toBeVisible()
  })

  it('should show "Select Interface" button when there is no interface data', async () => {
    render(
      <InterfaceTable
        value={[]}
      />
    )

    expect(await screen.findByRole('button', { name: 'Select interface' })).toBeVisible()
  })

  it('should do handleSelectPort correctly', async () => {
    const onChangeSpy = jest.fn()
    render(
      <InterfaceTable
        onChange={onChangeSpy}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    expect(screen.getByTestId('SelectInterfaceDrawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Select Port' }))
    // eslint-disable-next-line max-len
    expect(onChangeSpy).toHaveBeenCalledWith(mockVipConfig[0].interfaces)
  })

  it('should do clear correctly', async () => {
    const onChangeSpy = jest.fn()
    const onClearSpy = jest.fn()
    render(
      <InterfaceTable
        onChange={onChangeSpy}
        onClear={onClearSpy}
        value={mockVipConfig[0].interfaces}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Clear' }))
    // eslint-disable-next-line max-len
    expect(onChangeSpy).toHaveBeenCalledWith(undefined)
    expect(onClearSpy).toHaveBeenCalled()
  })
})
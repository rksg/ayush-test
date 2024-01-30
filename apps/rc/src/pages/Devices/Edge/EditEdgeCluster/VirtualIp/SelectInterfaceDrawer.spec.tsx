import userEvent from '@testing-library/user-event'

import { EdgeClusterTableDataType, EdgeGeneralFixtures, EdgeSubInterfaceFixtures } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'

const mockedSetVisibleFn = jest.fn()
const mockedHandleFinishFn = jest.fn()

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockLanInterfaces } = EdgeSubInterfaceFixtures
const mockeSelectedInterface = [{
  interfaces: Object.fromEntries(Object.entries(mockLanInterfaces)
    .map(([k, v]) => [k, v[0]])),
  vip: '1.1.1.1'
}]

describe('VirtualIp - SelectInterfaceDrawer', () => {
  it('should render InterfaceTable successfully', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        currentVipIndex={0}
        currentCluster={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
      />
    )
    expect(screen.getByText('Select Interfaces: #1 Virtual IP')).toBeVisible()
    expect(await screen.findByText('Smart Edge 1')).toBeVisible()
    expect(await screen.findByText('Smart Edge 2')).toBeVisible()
    expect(screen.getAllByRole('combobox', { name: 'Select Port' }).length).toBe(2)
  })

  it('should show ip/subnet as extra text', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        currentVipIndex={0}
        currentCluster={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        lanInterfaces={mockLanInterfaces}
      />
    )

    const selectPortDropdowns = await screen.findAllByRole('combobox', { name: 'Select Port' })
    await userEvent.click(selectPortDropdowns[0])
    await userEvent.click(await screen.findByText('Port2'))
    expect(await screen.findByText('IP subnet: 192.168.13.136/ 24')).toBeVisible()
  })

  it('should filtered selected interface', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        currentVipIndex={0}
        currentCluster={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        lanInterfaces={mockLanInterfaces}
        selectedInterfaces={mockeSelectedInterface}
      />
    )

    const selectPortDropdowns = await screen.findAllByRole('combobox', { name: 'Select Port' })
    await userEvent.click(selectPortDropdowns[0])
    expect(await screen.findByText('Port2')).toBeInTheDocument()
    expect(screen.queryByText('Port3')).not.toBeInTheDocument()
  })

  it('should show edit data correctly', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        currentVipIndex={0}
        currentCluster={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        lanInterfaces={mockLanInterfaces}
        selectedInterfaces={mockeSelectedInterface}
        editData={mockeSelectedInterface[0].interfaces}
      />
    )

    const selectPortDropdowns = await screen.findAllByRole('combobox', { name: 'Select Port' })
    await userEvent.click(selectPortDropdowns[0])
    expect(await screen.findByText('Port2')).toBeInTheDocument()
    expect((await screen.findAllByText('Port3')).length).toBe(3)
    expect((await screen.findAllByText('IP subnet: 192.168.14.135/ 24')).length).toBe(2)
  })

  it('should submit successfully', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        currentVipIndex={0}
        currentCluster={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        lanInterfaces={mockLanInterfaces}
        selectedInterfaces={mockeSelectedInterface}
        editData={mockeSelectedInterface[0].interfaces}
      />
    )

    expect((await screen.findAllByText('IP subnet: 192.168.14.135/ 24')).length).toBe(2)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedHandleFinishFn).toBeCalledWith(mockeSelectedInterface[0].interfaces, 0)
    expect(mockedSetVisibleFn).toBeCalledWith(false)
  })
})
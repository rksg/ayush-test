import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgeGeneralFixtures, EdgeStatus } from '@acx-ui/rc/utils'
import { render, renderHook, screen }      from '@acx-ui/test-utils'

import { mockVipInterfaces }     from './__tests__/fixtures'
import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'

const { mockEdgeClusterList } = EdgeGeneralFixtures

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options,
    dropdownClassName, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option) => (
        <option
          key={`option-${option.value}`}
          value={option.value as string}>
          {option.label}
        </option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('InterfaceTable', () => {
  it('should render InterfaceTable successfully', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={() => {}}
        handleFinish={() => {}}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    expect(screen.getByText('Select Interfaces: #1 Virtual IP')).toBeVisible()
    expect(await screen.findByText('Smart Edge 1')).toBeVisible()
    expect(await screen.findByText('Smart Edge 2')).toBeVisible()
    expect((await screen.findAllByRole('combobox', { name: 'Select Port' })).length).toBe(2)
  })

  it('should show the correct ip of selected port', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={() => {}}
        handleFinish={() => {}}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
      />
    )

    expect(screen.getByText('Select Interfaces: #1 Virtual IP')).toBeVisible()
    expect(await screen.findByText('Smart Edge 1')).toBeVisible()
    expect(await screen.findByText('Smart Edge 2')).toBeVisible()
    expect((await screen.findAllByRole('combobox', { name: 'Select Port' })).length).toBe(2)
    await userEvent.selectOptions(
      screen.getAllByRole('combobox', { name: 'Select Port' })[0],
      'port3'
    )
    expect(await screen.findByText('IP subnet: 192.168.14.135/ 24')).toBeVisible()
  })

  it('should show "Dymanic" when selecting DHCP port', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={() => {}}
        handleFinish={() => {}}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
      />
    )

    expect(screen.getByText('Select Interfaces: #1 Virtual IP')).toBeVisible()
    expect(await screen.findByText('Smart Edge 1')).toBeVisible()
    expect(await screen.findByText('Smart Edge 2')).toBeVisible()
    expect((await screen.findAllByRole('combobox', { name: 'Select Port' })).length).toBe(2)
    await userEvent.selectOptions(
      screen.getAllByRole('combobox', { name: 'Select Port' })[0],
      'lag0'
    )
    expect(await screen.findByText('IP subnet: Dynamic')).toBeVisible()
  })

  it('should be blocked when the subnet range of the two node are not consistent', async () => {
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={() => {}}
        handleFinish={() => {}}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
      />
    )

    expect(screen.getByText('Select Interfaces: #1 Virtual IP')).toBeVisible()
    expect(await screen.findByText('Smart Edge 1')).toBeVisible()
    expect(await screen.findByText('Smart Edge 2')).toBeVisible()
    const selectPortList = await screen.findAllByRole('combobox', { name: 'Select Port' })
    expect(selectPortList.length).toBe(2)
    await userEvent.selectOptions(
      selectPortList[0],
      'port2'
    )
    await userEvent.selectOptions(
      selectPortList[1],
      'port3'
    )
    // eslint-disable-next-line max-len
    expect((await screen.findAllByText('Use IP addresses in the same subnet for cluster interface on all the edges in this cluster.'))[0]).toBeVisible()
  })

  it('should submit successfully', async () => {
    const setVisibleSpy = jest.fn()
    const handleFinishSpy = jest.fn()
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={setVisibleSpy}
        handleFinish={handleFinishSpy}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
      />
    )

    const selectPortList = await screen.findAllByRole('combobox', { name: 'Select Port' })
    expect(selectPortList.length).toBe(2)
    await userEvent.selectOptions(
      selectPortList[0],
      'port3'
    )
    await userEvent.selectOptions(
      selectPortList[1],
      'port3'
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(handleFinishSpy).toHaveBeenCalledWith(mockEdgeClusterList.data[0].edgeList.map(item => ({
      serialNumber: item.serialNumber,
      portName: 'port3'
    })))
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })

  it('should close drawer successfully', async () => {
    const setVisibleSpy = jest.fn()
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={setVisibleSpy}
        handleFinish={() => {}}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })

  it('should set edit data correctly', async () => {
    const setVisibleSpy = jest.fn()
    const handleFinishSpy = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
    const lanInterfaceKeys = Object.keys(mockVipInterfaces)
    const editData = mockEdgeClusterList.data[0].edgeList.map(item => ({
      serialNumber: item.serialNumber,
      portName: 'port3'
    }))
    render(
      <SelectInterfaceDrawer
        visible={true}
        setVisible={setVisibleSpy}
        handleFinish={handleFinishSpy}
        currentVipIndex={0}
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        lanInterfaces={mockVipInterfaces}
        editData={editData}
      />
    )

    const selectPortList = await screen.findAllByRole('combobox', { name: 'Select Port' })
    expect(selectPortList.length).toBe(2)
    expect(result.current[0].getFieldsValue()).toStrictEqual({
      [lanInterfaceKeys[0]]: { port: 'port3' },
      [lanInterfaceKeys[1]]: { port: 'port3' }
    })
    expect((await screen.findAllByText('IP subnet: 192.168.14.135/ 24')).length).toBe(2)
  })
})
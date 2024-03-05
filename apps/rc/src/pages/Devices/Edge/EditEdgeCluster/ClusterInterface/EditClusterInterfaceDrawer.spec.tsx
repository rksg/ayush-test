
import userEvent from '@testing-library/user-event'

import { EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EditClusterInterfaceDrawer } from './EditClusterInterfaceDrawer'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    loading, children, onChange, options, dropdownClassName, ...props
  }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})
const mockedSetVisibleFn = jest.fn()
const mockedHandleFinishFn = jest.fn()

const { mockClusterInterfaceOptionData } = EdgePortConfigFixtures

const mockedAllNodeData = [
  {
    nodeName: 'Smart Edge 1',
    serialNumber: 'serialNumber-1',
    interfaceName: 'lag0',
    ip: '192.168.12.135',
    subnet: '255.255.255.0'
  },
  {
    nodeName: 'Smart Edge 2',
    serialNumber: 'serialNumber-2',
    interfaceName: 'lag0',
    ip: '192.168.12.136',
    subnet: '255.255.255.0'
  }
]

describe('ClusterInterface - EditClusterInterfaceDrawer', () => {
  it('should render EditClusterInterfaceDrawer successfully', async () => {
    render(
      <EditClusterInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
        editData={mockedAllNodeData[0]}
        allNodeData={mockedAllNodeData}
      />
    )

    expect(screen.getByText('Select Cluster Interface: Smart Edge 1')).toBeVisible()
    expect(screen.getByRole('combobox', { name: /Set cluster interface on/i })).toHaveValue('lag0')
    expect(screen.getByRole('textbox', { name: 'IP Address' })).toHaveValue('192.168.12.135')
    expect(screen.getByRole('textbox', { name: 'Subnet Mask' })).toHaveValue('255.255.255.0')
  })

  it('should submit data successfully', async () => {
    render(
      <EditClusterInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
        editData={mockedAllNodeData[0]}
        allNodeData={mockedAllNodeData}
      />
    )

    expect(screen.getByText('Select Cluster Interface: Smart Edge 1')).toBeVisible()
    expect(screen.getByRole('combobox', { name: /Set cluster interface on/i })).toHaveValue('lag0')
    expect(screen.getByRole('textbox', { name: 'IP Address' })).toHaveValue('192.168.12.135')
    expect(screen.getByRole('textbox', { name: 'Subnet Mask' })).toHaveValue('255.255.255.0')
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(mockedHandleFinishFn).toBeCalledWith(mockedAllNodeData[0]))
    expect(mockedSetVisibleFn).toBeCalledWith(false)
  })

  it('should be closed when clicking cancel button', async () => {
    render(
      <EditClusterInterfaceDrawer
        visible={true}
        setVisible={mockedSetVisibleFn}
        handleFinish={mockedHandleFinishFn}
        interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
        editData={mockedAllNodeData[0]}
        allNodeData={mockedAllNodeData}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedSetVisibleFn).toBeCalledWith(false)
  })
})
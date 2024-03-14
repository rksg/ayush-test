import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgePortConfigFixtures }     from '@acx-ui/rc/utils'
import { render, renderHook, screen } from '@acx-ui/test-utils'


import { EdgeClusterInterfaceSettingForm } from '.'

const { mockClusterInterfaceOptionData } = EdgePortConfigFixtures

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

describe('EdgeClusterInterfaceSettingForm', () => {

  it('Should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          form={formRef.current}
        />
      </Form>
    )

    expect(screen.getByRole('combobox', { name: 'Set cluster interface on:' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'IP Address' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Subnet Mask' })).toBeVisible()
  })

  it('Should set ip and subnet correctly when selecting interface', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
        />
      </Form>
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Set cluster interface on:' }),
      mockClusterInterfaceOptionData['serialNumber-1'][0].portName
    )
    expect(screen.getByRole('textbox', { name: 'IP Address' }))
      .toHaveValue(mockClusterInterfaceOptionData['serialNumber-1'][0].ip)
    expect(screen.getByRole('textbox', { name: 'Subnet Mask' }))
      .toHaveValue(mockClusterInterfaceOptionData['serialNumber-1'][0].subnet)
  })

  it('Should block by subnet range not consistent', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const mockedAllNodeData = [
      {
        nodeName: 'Smart Edge 1',
        serialNumber: 'serialNumber-1',
        interfaceName: 'lag0',
        ip: '192.168.11.136',
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

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
          currentNodetData={mockedAllNodeData[0]}
          allNodeData={mockedAllNodeData}
        />
      </Form>
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Set cluster interface on:' }),
      mockClusterInterfaceOptionData['serialNumber-1'][0].portName
    )
    const ipField = screen.getByRole('textbox', { name: 'IP Address' })
    await userEvent.clear(ipField)
    await userEvent.type(ipField, '192.168.13.136')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('The ip setting is not in the same subnet as other nodes.')).toBeVisible()
  })

  it('Should block by the same ip', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const mockedAllNodeData = [
      {
        nodeName: 'Smart Edge 1',
        serialNumber: 'serialNumber-1',
        interfaceName: 'lag0',
        ip: '192.168.11.136',
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

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
          currentNodetData={mockedAllNodeData[0]}
          allNodeData={mockedAllNodeData}
        />
      </Form>
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Set cluster interface on:' }),
      mockClusterInterfaceOptionData['serialNumber-1'][0].portName
    )
    const ipField = screen.getByRole('textbox', { name: 'IP Address' })
    await userEvent.clear(ipField)
    await userEvent.type(ipField, '192.168.12.136')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IP address cannot be the same as other nodes.')).toBeVisible()
  })
})
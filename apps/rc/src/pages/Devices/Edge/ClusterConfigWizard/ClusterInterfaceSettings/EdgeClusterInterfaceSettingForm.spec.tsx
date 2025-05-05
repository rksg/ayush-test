import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgeIpModeEnum, EdgePortConfigFixtures, VirtualIpSetting } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                               from '@acx-ui/test-utils'

import { EdgeClusterInterfaceSettingForm } from './EdgeClusterInterfaceSettingForm'

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
      {children ? children : null}
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

const mockedAllNodeData = {
  'serialNumber-1': {
    nodeName: 'Smart Edge 1',
    serialNumber: 'serialNumber-1',
    interfaceName: 'lag0',
    ipMode: EdgeIpModeEnum.STATIC,
    ip: '192.168.11.136',
    subnet: '255.255.255.0'
  },
  'serialNumber-2': {
    nodeName: 'Smart Edge 2',
    serialNumber: 'serialNumber-2',
    interfaceName: 'lag0',
    ipMode: EdgeIpModeEnum.STATIC,
    ip: '192.168.11.135',
    subnet: '255.255.255.0'
  }
}

describe('EdgeClusterInterfaceSettingForm', () => {

  it('Should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          serialNumber='serialNumber-1'
          form={formRef.current}
        />
      </Form>
    )

    expect(screen.getByRole('combobox', { name: 'Set cluster interface on:' })).toBeVisible()
    await userEvent.click(screen.getByRole('radio', { name: 'Static/Manual' }))
    expect(screen.getByRole('radio', { name: 'DHCP' })).toBeVisible()
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
          serialNumber='serialNumber-1'
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
        />
      </Form>
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Set cluster interface on:' }),
      mockClusterInterfaceOptionData['serialNumber-1'][0].portName
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Static/Manual' }))
    const ip = await screen.findByRole('textbox', { name: 'IP Address' })
    expect(ip).not.toHaveValue(mockClusterInterfaceOptionData['serialNumber-1'][0].ip)
    expect(ip).toHaveValue(mockClusterInterfaceOptionData['serialNumber-1'][0].ip.split('/')[0])
    expect(screen.getByRole('textbox', { name: 'Subnet Mask' }))
      .toHaveValue(mockClusterInterfaceOptionData['serialNumber-1'][0].subnet)
  })

  it('Should be able to use DHCP mode when selecting interface', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          serialNumber='serialNumber-1'
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
        />
      </Form>
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Set cluster interface on:' }),
      mockClusterInterfaceOptionData['serialNumber-1'][0].portName
    )
    await userEvent.click(screen.getByRole('radio', { name: 'DHCP' }))
  })

  it('Should block by subnet range not consistent', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue(mockedAllNodeData)

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          serialNumber='serialNumber-1'
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
          rootNamePath={['serialNumber-1']}
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
    expect(await screen.findByText('Use IP addresses in the same subnet for Cluster interface on all the edges in this Cluster.')).toBeVisible()
  })

  it('Should block by the same ip', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue(mockedAllNodeData)

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          serialNumber='serialNumber-1'
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
          rootNamePath={['serialNumber-1']}
        />
      </Form>
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Set cluster interface on:' }),
      mockClusterInterfaceOptionData['serialNumber-1'][0].portName
    )
    const ipField = screen.getByRole('textbox', { name: 'IP Address' })
    await userEvent.clear(ipField)
    await userEvent.type(ipField, '192.168.11.135')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IP address cannot be the same as other nodes.')).toBeVisible()
  })

  it('Should block by different port type', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      'serialNumber-1': mockedAllNodeData['serialNumber-1'],
      'serialNumber-2': {
        ...mockedAllNodeData['serialNumber-2'],
        interfaceName: 'port1'
      }
    })

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          serialNumber='serialNumber-1'
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
          rootNamePath={['serialNumber-1']}
        />
      </Form>
    )

    formRef.current.submit()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Make sure you select the same interface type (physical port or LAG) as that of another node in this cluster.')).toBeVisible()
  })

  it('should disable the interface option which set as a VRRP interface', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      'serialNumber-1': mockedAllNodeData['serialNumber-1'],
      'serialNumber-2': mockedAllNodeData['serialNumber-2']
    })

    render(
      <Form form={formRef.current}>
        <EdgeClusterInterfaceSettingForm
          serialNumber='serialNumber-1'
          form={formRef.current}
          interfaceList={mockClusterInterfaceOptionData['serialNumber-1']}
          rootNamePath={['serialNumber-1']}
          vipConfig={[{
            ports: [{
              serialNumber: 'serialNumber-1',
              portName: 'port3'
            }]
          }] as VirtualIpSetting[]}
        />
      </Form>
    )

    const options = await screen.findAllByRole('option')
    expect(options[0].innerHTML).toBe('Lag0')
    expect(options[0]).not.toBeDisabled()
    expect(options[1].innerHTML).toBe('Port3')
    expect(options[1]).toBeDisabled()
  })
})
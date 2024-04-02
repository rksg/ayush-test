import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgeGeneralFixtures, EdgePortConfigFixtures, EdgePortInfo, EdgeStatus } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                                            from '@acx-ui/test-utils'

import { VipCard } from './VipCard'

jest.mock('./InterfaceTable', () => ({
  ...jest.requireActual('./InterfaceTable'),
  InterfaceTable: () => <div data-testid='InterfaceTable' />
}))

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockLanInterfaces } = EdgePortConfigFixtures

describe('InterfaceTable', () => {
  it('should render VipCard successfully', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [{}])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{}}
              />)
          }
        </Form.List>
      </Form>
    )

    expect(screen.getByText('#1 Virtual IP')).toBeVisible()
    expect(await screen.findByTestId('InterfaceTable')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Virtual IP Address' })).toBeVisible()
  })

  it('should be blocked when the config is incomplete', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      const lanInterfaceKeys = Object.keys(mockLanInterfaces)
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'port3')
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{}}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )

    formRef.current.submit()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Please make sure you select an interface and configure the IP subnet for the SmartEdge(s).')).toBeVisible()
  })

  it('should be blocked when the config has invalide ip', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      const lanInterfaceKeys = Object.keys(mockLanInterfaces)
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'port3'),
          [lanInterfaceKeys[1]]: {
            ...mockLanInterfaces[
              lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
            ].find(item => item.portName === 'port3'),
            ip: '12345'
          }
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{}}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )

    formRef.current.submit()
    expect(await screen.findByText('Please enter a valid IP address')).toBeVisible()
  })

  it('should be blocked when the subnet is not consistent', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      const lanInterfaceKeys = Object.keys(mockLanInterfaces)
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'port3'),
          [lanInterfaceKeys[1]]: {
            ...mockLanInterfaces[
              lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
            ].find(item => item.portName === 'port2')
          }
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{}}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )

    formRef.current.submit()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Make sure that each node is within the same subnet range.')).toBeVisible()
  })

  it('should be blocked when the vip is not in the subnet range', async () => {
    const lanInterfaceKeys = Object.keys(mockLanInterfaces)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'port3'),
          [lanInterfaceKeys[1]]: {
            ...mockLanInterfaces[
              lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
            ].find(item => item.portName === 'port3')
          }
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{
                  0: {
                    interfaces: {
                      [lanInterfaceKeys[0]]: mockLanInterfaces[
                        lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
                      ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo,
                      [lanInterfaceKeys[1]]: {
                        ...mockLanInterfaces[
                          lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
                        ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo
                      }
                    },
                    vip: ''
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Virtual IP Address' }),
      '1.2.3.4'
    )
    expect(await screen.findByText('IP address is not in the subnet pool')).toBeVisible()
  })

  it('should be blocked when the vip is the same as any node', async () => {
    const lanInterfaceKeys = Object.keys(mockLanInterfaces)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'port3'),
          [lanInterfaceKeys[1]]: {
            ...mockLanInterfaces[
              lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
            ].find(item => item.portName === 'port3')
          }
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{
                  0: {
                    interfaces: {
                      [lanInterfaceKeys[0]]: mockLanInterfaces[
                        lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
                      ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo,
                      [lanInterfaceKeys[1]]: {
                        ...mockLanInterfaces[
                          lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
                        ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo
                      }
                    },
                    vip: ''
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Virtual IP Address' }),
      '192.168.14.135'
    )
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Virtual IP cannot be the same as any node interface IP.')).toBeVisible()
  })

  it('should show suggested range correctly', async () => {
    const lanInterfaceKeys = Object.keys(mockLanInterfaces)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'port3'),
          [lanInterfaceKeys[1]]: {
            ...mockLanInterfaces[
              lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
            ].find(item => item.portName === 'port3')
          }
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{
                  0: {
                    interfaces: {
                      [lanInterfaceKeys[0]]: mockLanInterfaces[
                        lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
                      ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo,
                      [lanInterfaceKeys[1]]: {
                        ...mockLanInterfaces[
                          lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
                        ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo
                      }
                    },
                    vip: ''
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Suggested range: 192.168.14.0/ 24')).toBeVisible()
  })

  it('should not show suggested range when there are some dhcp port', async () => {
    const lanInterfaceKeys = Object.keys(mockLanInterfaces)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [{
        interfaces: {
          [lanInterfaceKeys[0]]: mockLanInterfaces[
            lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
          ].find(item => item.portName === 'lag0'),
          [lanInterfaceKeys[1]]: {
            ...mockLanInterfaces[
              lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
            ].find(item => item.portName === 'port3')
          }
        }
      }])
      return form
    })

    render(
      <Form form={formRef.current}>
        <Form.List name='vipConfig'>
          {
            (fields, { remove }) => fields.map((field, index) =>
              <VipCard
                key={`vip-${field.key}`}
                rootNamePath={['vipConfig']}
                field={field}
                index={index}
                remove={remove}
                vipConfig={{
                  0: {
                    interfaces: {
                      [lanInterfaceKeys[0]]: mockLanInterfaces[
                        lanInterfaceKeys[0] as keyof typeof mockLanInterfaces
                      ].find(item => item.portName === 'lag0') ?? {} as EdgePortInfo,
                      [lanInterfaceKeys[1]]: {
                        ...mockLanInterfaces[
                          lanInterfaceKeys[1] as keyof typeof mockLanInterfaces
                        ].find(item => item.portName === 'port3') ?? {} as EdgePortInfo
                      }
                    },
                    vip: ''
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
              />)
          }
        </Form.List>
      </Form>
    )
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Suggested range: --')).toBeVisible()
  })
})
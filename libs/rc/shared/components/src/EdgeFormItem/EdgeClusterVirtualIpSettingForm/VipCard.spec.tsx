import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgeGeneralFixtures, EdgeStatus } from '@acx-ui/rc/utils'
import { render, renderHook, screen }      from '@acx-ui/test-utils'

import { mockVipInterfaces } from './__tests__/fixtures'
import { VipCard }           from './VipCard'

import { VipInterface } from '.'

jest.mock('./InterfaceTable', () => ({
  ...jest.requireActual('./InterfaceTable'),
  InterfaceTable: () => <div data-testid='InterfaceTable' />
}))

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures

describe('VipCard', () => {
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
      form.setFieldValue(
        'vipConfig',
        [mockedHaNetworkSettings.virtualIpSettings.map(item => ({
          vip: item.virtualIp,
          interfaces: item.ports
        }))[0]]
      )
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
    expect(await screen.findByText('Please make sure you select an interface and configure the IP subnet for the RUCKUS Edge(s).')).toBeVisible()
  })

  it('should be blocked when the config has invalid ip', async () => {
    const lanInterfaceKeys = Object.keys(mockVipInterfaces)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(
        'vipConfig',
        mockedHaNetworkSettings.virtualIpSettings.map(item => ({
          vip: item.virtualIp,
          interfaces: item.ports
        }))
      )
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
                lanInterfaces={{
                  [lanInterfaceKeys[0]]: [{
                    ...mockVipInterfaces[lanInterfaceKeys[0]].find(item =>
                      // eslint-disable-next-line max-len
                      item.interfaceName === mockedHaNetworkSettings.virtualIpSettings[0].ports[0].portName),
                    ip: '0.0.0.0'
                  }],
                  [lanInterfaceKeys[1]]: mockVipInterfaces[lanInterfaceKeys[1]]
                } as { [key: string]: VipInterface[] }}
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
      form.setFieldValue(
        'vipConfig',
        [{
          vip: mockedHaNetworkSettings.virtualIpSettings[0].virtualIp,
          interfaces: [
            mockedHaNetworkSettings.virtualIpSettings[0].ports[0],
            {
              serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
              portName: 'port3'
            }
          ]
        }]
      )
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
                lanInterfaces={mockVipInterfaces}
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
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(
        'vipConfig',
        mockedHaNetworkSettings.virtualIpSettings.map(item => ({
          vip: item.virtualIp,
          interfaces: item.ports
        }))
      )
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
                    interfaces: mockedHaNetworkSettings.virtualIpSettings[0].ports,
                    vip: mockedHaNetworkSettings.virtualIpSettings[0].virtualIp
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
                lanInterfaces={mockVipInterfaces}
              />)
          }
        </Form.List>
      </Form>
    )

    await userEvent.clear(
      screen.getByRole('textbox', { name: 'Virtual IP Address' })
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Virtual IP Address' }),
      '1.2.3.4'
    )
    expect(await screen.findByText('IP address is not in the subnet pool')).toBeVisible()
  })

  it('should be blocked when the vip is the same as any node', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(
        'vipConfig',
        mockedHaNetworkSettings.virtualIpSettings.map(item => ({
          vip: item.virtualIp,
          interfaces: item.ports
        }))
      )
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
                    interfaces: mockedHaNetworkSettings.virtualIpSettings[0].ports,
                    vip: mockedHaNetworkSettings.virtualIpSettings[0].virtualIp
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
                lanInterfaces={mockVipInterfaces}
              />)
          }
        </Form.List>
      </Form>
    )

    await userEvent.clear(
      screen.getByRole('textbox', { name: 'Virtual IP Address' })
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Virtual IP Address' }),
      '192.168.13.136'
    )
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Virtual IP cannot be the same as any node interface IP.')).toBeVisible()
  })

  it('should show suggested range correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(
        'vipConfig',
        [{
          vip: mockedHaNetworkSettings.virtualIpSettings[0].virtualIp,
          interfaces: [
            mockedHaNetworkSettings.virtualIpSettings[0].ports[0],
            {
              serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
              portName: 'port2'
            }
          ]
        }]
      )
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
                    interfaces: [
                      mockedHaNetworkSettings.virtualIpSettings[0].ports[0],
                      {
                        serialNumber: mockEdgeClusterList.data[0].edgeList[1].serialNumber,
                        portName: 'port2'
                      }
                    ],
                    vip: mockedHaNetworkSettings.virtualIpSettings[0].virtualIp
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
                lanInterfaces={mockVipInterfaces}
              />)
          }
        </Form.List>
      </Form>
    )
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Suggested range: 192.168.13.0/ 24')).toBeVisible()
  })

  it('should not show suggested range when there are some dhcp port', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(
        'vipConfig',
        mockedHaNetworkSettings.virtualIpSettings.map(item => ({
          vip: item.virtualIp,
          interfaces: item.ports
        }))
      )
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
                    interfaces: [
                      mockedHaNetworkSettings.virtualIpSettings[0].ports[0],
                      {
                        ...mockedHaNetworkSettings.virtualIpSettings[0].ports[1],
                        portName: 'lag0'
                      }
                    ],
                    vip: mockedHaNetworkSettings.virtualIpSettings[0].virtualIp
                  }
                }}
                nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
                lanInterfaces={mockVipInterfaces}
              />)
          }
        </Form.List>
      </Form>
    )
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Suggested range: --')).toBeVisible()
  })
})
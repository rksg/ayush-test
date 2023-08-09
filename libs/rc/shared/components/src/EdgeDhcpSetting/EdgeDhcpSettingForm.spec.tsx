import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { act }   from 'react-dom/test-utils'

import { StepsForm }                           from '@acx-ui/components'
import { render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { mockEdgeDhcpDataRelayOff, mockEdgeDhcpDataRelayOn } from './__tests__/fixtures'
import { EdgeDhcpSettingForm }                               from './EdgeDhcpSettingForm'

jest.mock('./DhcpPool/PoolDrawer', () => ({
  PoolDrawer: () => <div data-testid='mocked-PoolDrawer'></div>
}))
jest.mock('./DhcpOption/OptionDrawer', () => ({
  OptionDrawer: () => <div data-testid='mocked-OptionDrawer'></div>
}))
jest.mock('./DhcpHost/HostDrawer', () => ({
  HostDrawer: () => <div data-testid='mocked-HostDrawer'></div>
}))

describe('EdgeDhcpSettingForm', () => {
  it('should show external dhcp server setting', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(await screen.findByTestId('steps-form')).toBeVisible()
    expect(await screen.findByText('Service Name')).toBeVisible()
    expect(await screen.findByRole('textbox', { name: 'Primary DNS Server' })).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: 'DHCP Relay:' }))
    expect(await screen.findByRole('textbox', { name: 'FQDN Name or IP Address' })).toBeVisible()
  })

  it('should show secondary dns server', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    expect(await screen.findByRole('textbox', { name: 'Secondary DNS Server' })).toBeVisible()
  })

  it('should show error dns ip is invalid', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add Secondary DNS Server' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Primary DNS Server' }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: 'Secondary DNS Server' }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }), 'test')
    const errors = await screen.findAllByText('Please enter a valid IP address' )
    expect(errors.length).toBe(2)
  })

  it('should show relay and pool gateway dependency error', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockEdgeDhcpDataRelayOn)
      return form
    })

    const mockedUpdateReq = jest.fn()

    render(
      <StepsForm editMode={true} form={formRef.current} onFinish={mockedUpdateReq}>
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    const pools = await screen.findAllByRole('row', { name: /PoolTest/i })
    expect(pools.length).toBe(1)
    expect(screen.getByRole('switch', { name: 'DHCP Relay:' })).toBeChecked()
    // change relay from ON to OFF
    await userEvent.click(screen.getByRole('switch', { name: 'DHCP Relay:' }))
    expect(screen.getByRole('switch', { name: 'DHCP Relay:' })).not.toBeChecked()
    expect(await screen.findByRole('radio', { name: 'Infinite' })).toBeChecked()

    // change lease time type
    await userEvent.click(await screen.findByRole( 'radio', { name: 'Limit to' }))
    expect(await screen.findByRole('spinbutton')).toBeVisible()

    // dependency error
    await screen.findByText('PoolTest1 : gateway is required' )

    act(() => {
      formRef.current.setFieldValue('dhcpPools', [{
        id: '1',
        poolName: 'PoolTest1',
        subnetMask: '255.255.255.0',
        poolStartIp: '1.1.1.1',
        poolEndIp: '1.1.1.10',
        gatewayIp: '1.1.1.127',
        activated: true
      }])
    })

    await screen.findByText('1.1.1.127' )
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith({
      id: '1',
      serviceName: 'test',
      dhcpRelay: false,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: '',
      primaryDnsIp: '',
      secondaryDnsIp: '',
      leaseTime: 24,
      leaseTimeType: 'Limited',
      leaseTimeUnit: 'HOURS',
      dhcpPools: [
        {
          id: '1',
          poolName: 'PoolTest1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.10',
          gatewayIp: '1.1.1.127',
          activated: true
        }
      ],
      dhcpOptions: [],
      hosts: []
    }))
  })

  it('should clear pool gateway when relay is switched to enabled', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockEdgeDhcpDataRelayOff)
      return form
    })

    const mockedUpdateReq = jest.fn()

    render(
      <StepsForm editMode={true} form={formRef.current} onFinish={mockedUpdateReq}>
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    const pools = await screen.findAllByRole('row', { name: /RelayOffPoolTest/i })
    expect(pools.length).toBe(1)
    expect(screen.getByRole('switch', { name: 'DHCP Relay:' })).not.toBeChecked()

    // change lease time type into infinite
    await userEvent.click(await screen.findByText( 'Infinite' ))

    // change relay from OFF to ON
    await userEvent.click(screen.getByRole('switch', { name: 'DHCP Relay:' }))
    expect(screen.getByRole('switch', { name: 'DHCP Relay:' })).toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith({
      id: '1',
      serviceName: 'testRelayOff',
      dhcpRelay: true,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: '',
      primaryDnsIp: '',
      secondaryDnsIp: '',
      leaseTime: 25,
      leaseTimeType: 'Infinite',
      leaseTimeUnit: 'HOURS',
      dhcpPools: [
        {
          id: '1',
          poolName: 'RelayOffPoolTest1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.10',
          gatewayIp: '',
          activated: true
        }
      ],
      dhcpOptions: [],
      hosts: []
    }))
  })

  it('pool gateway should be empty when relay is enabled', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockEdgeDhcpDataRelayOn)
      return form
    })

    const mockedUpdateReq = jest.fn()

    render(
      <StepsForm editMode={true} form={formRef.current} onFinish={mockedUpdateReq}>
        <StepsForm.StepForm>
          <EdgeDhcpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    const pools = await screen.findAllByRole('row', { name: /PoolTest/i })
    expect(pools.length).toBe(1)
    expect(screen.getByRole('switch', { name: 'DHCP Relay:' })).toBeChecked()

    act(() => {
      formRef.current.setFieldValue('dhcpPools', [{
        id: '1',
        poolName: 'PoolTest1',
        subnetMask: '255.255.255.0',
        poolStartIp: '1.1.1.1',
        poolEndIp: '1.1.1.10',
        gatewayIp: '1.1.1.127',
        activated: true
      }])

      formRef.current.validateFields(['dhcpPools'])
    })

    // dependency error
    await screen.findByText('PoolTest1 : gateway should be empty when relay is enabled' )

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedUpdateReq).toBeCalledTimes(0)
  })
})

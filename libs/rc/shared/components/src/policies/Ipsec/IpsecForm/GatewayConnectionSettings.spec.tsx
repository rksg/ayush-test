import { Form, FormInstance } from 'antd'
import { IntlProvider }       from 'react-intl'

import { IpSecAuthEnum, defaultIpsecFormData }   from '@acx-ui/rc/utils'
import { render, fireEvent, screen, renderHook } from '@acx-ui/test-utils'

import GatewayConnectionSettings from './GatewayConnectionSettings'

jest.mock('../../../ApCompatibility/ApCompatibilityToolTip', () => ({
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />
}))

jest.mock('../../../ApCompatibility/ApCompatibilityDrawer', () => ({
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

describe('GatewayConnectionSettings', () => {
  const renderComponent = (initialValues = {
    ...defaultIpsecFormData,
    advancedOption: {
      ipcompEnable: true,
      enforceNatt: false
    }
  }, formRef?: FormInstance) => {
    return render(
      <IntlProvider locale='en'>
        <Form form={formRef} initialValues={initialValues}>
          <GatewayConnectionSettings />
        </Form>
      </IntlProvider>
    )
  }

  it('renders with no props', () => {
    renderComponent()
    expect(screen.getByText('Gateway')).toBeInTheDocument()
    expect(screen.getByText('IP Compression')).toBeInTheDocument()
    expect(screen.getByText('Force NAT-T')).toBeInTheDocument()
  })

  it('toggles checkboxes', () => {
    renderComponent()

    //retryLimit should be checked by default
    const retryLimitEnabledCheckbox = screen.getByTestId('retryLimitEnabled')
    expect(retryLimitEnabledCheckbox).toBeChecked()
    expect(screen.getByTestId('advOpt-retryLimit')).toBeInTheDocument()

    fireEvent.click(retryLimitEnabledCheckbox)
    expect(retryLimitEnabledCheckbox).not.toBeChecked()
    expect(screen.queryByTestId('advOpt-retryLimit')).not.toBeInTheDocument()

    //espReplayWindow should be checked by default
    const espReplayWindowEnabledCheckbox = screen.getByTestId('espReplayWindowEnabled')
    expect(espReplayWindowEnabledCheckbox).toBeChecked()
    expect(screen.getByTestId('advOpt-replayWindow')).toBeInTheDocument()

    fireEvent.click(espReplayWindowEnabledCheckbox)
    expect(espReplayWindowEnabledCheckbox).not.toBeChecked()
    expect(screen.queryByTestId('advOpt-replayWindow')).not.toBeInTheDocument()

    //deadPeerDetectionDelay should be checked by default
    const deadPeerDetectionDelayEnabledCheckbox =
      screen.getByTestId('deadPeerDetectionDelayEnabled')
    expect(deadPeerDetectionDelayEnabledCheckbox).toBeChecked()
    expect(screen.getByTestId('advOpt-dpdDelay')).toBeInTheDocument()

    fireEvent.click(deadPeerDetectionDelayEnabledCheckbox)
    expect(deadPeerDetectionDelayEnabledCheckbox).not.toBeChecked()
    expect(screen.queryByTestId('advOpt-dpdDelay')).not.toBeInTheDocument()

    //nattKeepAliveInterval should be checked by default
    const nattKeepAliveIntervalEnabledCheckbox =
    screen.getByTestId('nattKeepAliveIntervalEnabled')
    expect(nattKeepAliveIntervalEnabledCheckbox).toBeChecked()
    expect(screen.getByTestId('advOpt-keepAliveInterval')).toBeInTheDocument()

    fireEvent.click(nattKeepAliveIntervalEnabledCheckbox)
    expect(nattKeepAliveIntervalEnabledCheckbox).not.toBeChecked()
    expect(screen.queryByTestId('advOpt-keepAliveInterval')).not.toBeInTheDocument()
  })

  it('toggles IP compression switch', () => {
    renderComponent()
    const ipCompressionSwitch = screen.getByTestId('advOpt-ipcompEnable')
    expect(ipCompressionSwitch).not.toBeChecked()
    fireEvent.click(ipCompressionSwitch)
    expect(ipCompressionSwitch).toBeChecked()
  })

  it('toggles force NAT-T switch', () => {
    renderComponent()
    const forceNATTSwitch = screen.getByTestId('advOpt-enforceNatt')
    expect(forceNATTSwitch).not.toBeChecked()
    fireEvent.click(forceNATTSwitch)
    expect(forceNATTSwitch).toBeChecked()
  })
})

it('renders disabled retryLimit and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    form.setFieldsValue(defaultIpsecFormData)
    return form
  })
  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    ...defaultIpsecFormData
  }
  render(<Form form={formRef.current} initialValues={defaultIpsecFormData}>
    <GatewayConnectionSettings
      editData={customizedValue}/>
  </Form>)

  expect(screen.getByText('Retry Limit')).toBeInTheDocument()

  // Check if the retryLimit element is visible
  const retryLimitElement = screen.getByTestId('advOpt-retryLimit')
  expect(retryLimitElement).toBeInTheDocument()

  // Verify the value of the InputNumber
  const retryLimitInput = retryLimitElement.querySelector('input')
  expect(Number(retryLimitInput!.value)).toBe(5) // Check if the default value is set correctly
})

it('renders disabled releyWindow and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })

  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    ...defaultIpsecFormData

  }
  render(<Form form={formRef.current} initialValues={defaultIpsecFormData}>
    <GatewayConnectionSettings
      editData={customizedValue}
    /></Form>)
  expect(screen.getByText('ESP Replay Window')).toBeInTheDocument()

  // Check if the relayWindow element is visible
  const relayWindowElement = screen.getByTestId('advOpt-replayWindow')
  expect(relayWindowElement).toBeInTheDocument()

  // Verify the value of the InputNumber
  const relayWindowInput = relayWindowElement.querySelector('input')
  expect(Number(relayWindowInput!.value)).toBe(32) // Check if the default value is set correctly
})

it('renders disabled DpD delay and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })

  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    ...defaultIpsecFormData
  }
  render(<Form form={formRef.current} initialValues={defaultIpsecFormData}>
    <GatewayConnectionSettings
      editData={customizedValue}
    /></Form>)
  expect(screen.getByText('Dead Peer Detection Delay')).toBeInTheDocument()

  // Check if the dpd delay element is visible
  const dpdDelayElement = screen.getByTestId('advOpt-dpdDelay')
  expect(dpdDelayElement).toBeInTheDocument()

  // Verify the value of the InputNumber
  const dpdDelayInput = dpdDelayElement.querySelector('input')
  expect(Number(dpdDelayInput!.value)).toBe(30) // Check if the default value is set correctly
})

it('renders disabled keep alive interval and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    form.setFieldsValue(defaultIpsecFormData)
    return form
  })

  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    ...defaultIpsecFormData
  }
  render(<Form form={formRef.current} initialValues={defaultIpsecFormData}>
    <GatewayConnectionSettings
      editData={customizedValue}
    /></Form>)
  expect(screen.getByText('NAT-T Keep Alive Interval')).toBeInTheDocument()

  // Check if the keep alive element is visible
  const keepAliveElement = screen.getByTestId('advOpt-keepAliveInterval')
  expect(keepAliveElement).toBeInTheDocument()

  // Verify the value of the InputNumber
  const keepAliveInput = keepAliveElement.querySelector('input')
  expect(Number(keepAliveInput!.value)).toBe(20) // Check if the default value is set correctly
})
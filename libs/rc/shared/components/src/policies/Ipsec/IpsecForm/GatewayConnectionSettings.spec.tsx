import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { IpSecAuthEnum, IpSecAdvancedOptionEnum, IpSecFailoverModeEnum } from '@acx-ui/rc/utils'
import { render, fireEvent, screen, renderHook }                         from '@acx-ui/test-utils'

import GatewayConnectionSettings from './GatewayConnectionSettings'

describe('GatewayConnectionSettings', () => {
  const renderComponent = (initialValues = {
    advancedOption: {
      ipcompEnable: true,
      enforceNatt: false
    }
  }) => {
    return render(
      <IntlProvider locale='en'>
        <Form initialValues={initialValues}>
          <GatewayConnectionSettings loadGwSettings setLoadGwSettings={jest.fn()} />
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

    //retryLimit
    const retryLimitEnabledCheckbox = screen.getByTestId('retryLimitEnabled')
    expect(retryLimitEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('advOpt-retryLimit')).not.toBeInTheDocument()

    fireEvent.click(retryLimitEnabledCheckbox)
    expect(retryLimitEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('advOpt-retryLimit')).toBeInTheDocument()

    //espReplayWindow
    const espReplayWindowEnabledCheckbox = screen.getByTestId('espReplayWindowEnabled')
    expect(espReplayWindowEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('advOpt-replayWindow')).not.toBeInTheDocument()

    fireEvent.click(espReplayWindowEnabledCheckbox)
    expect(espReplayWindowEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('advOpt-replayWindow')).toBeInTheDocument()

    //deadPeerDetectionDelay
    const deadPeerDetectionDelayEnabledCheckbox =
      screen.getByTestId('deadPeerDetectionDelayEnabled')
    expect(deadPeerDetectionDelayEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('advOpt-dpdDelay')).not.toBeInTheDocument()

    fireEvent.click(deadPeerDetectionDelayEnabledCheckbox)
    expect(deadPeerDetectionDelayEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('advOpt-dpdDelay')).toBeInTheDocument()

    //nattKeepAliveInterval
    const nattKeepAliveIntervalEnabledCheckbox =
    screen.getByTestId('nattKeepAliveIntervalEnabled')
    expect(nattKeepAliveIntervalEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('advOpt-keepAliveInterval')).not.toBeInTheDocument()

    fireEvent.click(nattKeepAliveIntervalEnabledCheckbox)
    expect(nattKeepAliveIntervalEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('advOpt-keepAliveInterval')).toBeInTheDocument()
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
    return form
  })
  let advancedOption = {
    dhcpOpt43Subcode: 1,
    retryLimit: 0, // default disable value
    replayWindow: 1,
    ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
    enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
    dpdDelay: 1,
    keepAliveInterval: 1,
    failoverRetryPeriod: 1,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1
  }
  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    advancedOption: advancedOption,
    retryLimitEnabledCheckbox: false // Ensure the checkbox is disabled
  }
  render(<Form form={formRef.current}>
    <GatewayConnectionSettings
      initIpSecData={customizedValue}
      loadGwSettings
      setLoadGwSettings={jest.fn()} /></Form>)
  expect(screen.getByText('Retry Limit')).toBeInTheDocument()

  // Check if the retryLimit element is not visible
  const retryLimitElement = screen.queryByTestId('advOpt-retryLimit')
  expect(retryLimitElement).not.toBeInTheDocument()

  // Enable the checkbox
  const retryLimitEnabledCheckbox = screen
    .getByTestId('retryLimitEnabled') as HTMLInputElement
  fireEvent.click(retryLimitEnabledCheckbox)
  expect(retryLimitEnabledCheckbox.checked).toBe(true)

  // Verify the value of the InputNumber
  const retryLimitAfterClick = screen.getByTestId('advOpt-retryLimit')
  expect(retryLimitAfterClick).toBeInTheDocument()
  const retryLimitInput = retryLimitAfterClick.querySelector('input')
  expect(Number(retryLimitInput!.value)).toBe(5) // Check if the default value is set correctly
})

it('renders disabled releyWindow and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })
  let advancedOption = {
    dhcpOpt43Subcode: 1,
    retryLimit: 1,
    replayWindow: 0, // default disable values
    ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
    enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
    dpdDelay: 1,
    keepAliveInterval: 1,
    failoverRetryPeriod: 1,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1
  }
  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    advancedOption: advancedOption,
    espReplayWindowEnabledCheckbox: false // Ensure the checkbox is disabled
  }
  render(<Form form={formRef.current}>
    <GatewayConnectionSettings
      initIpSecData={customizedValue}
      loadGwSettings
      setLoadGwSettings={jest.fn()} /></Form>)
  expect(screen.getByText('ESP Replay Window')).toBeInTheDocument()

  // Check if the relayWindow element is not visible
  const relayWindowElement = screen.queryByTestId('advOpt-replayWindow')
  expect(relayWindowElement).not.toBeInTheDocument()

  // Enable the checkbox
  const relayWindowEnabledCheckbox = screen
    .getByTestId('espReplayWindowEnabled') as HTMLInputElement
  fireEvent.click(relayWindowEnabledCheckbox)
  expect(relayWindowEnabledCheckbox.checked).toBe(true)

  // Verify the value of the InputNumber
  const relayWindowAfterClick = screen.getByTestId('advOpt-replayWindow')
  expect(relayWindowAfterClick).toBeInTheDocument()
  const relayWindowInput = relayWindowAfterClick.querySelector('input')
  expect(Number(relayWindowInput!.value)).toBe(32) // Check if the default value is set correctly
})

it('renders disabled DpD delay and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })
  let advancedOption = {
    dhcpOpt43Subcode: 1,
    retryLimit: 1,
    replayWindow: 1,
    ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
    enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
    dpdDelay: 0, // default disable values
    keepAliveInterval: 1,
    failoverRetryPeriod: 1,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1
  }
  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    advancedOption: advancedOption,
    deadPeerDetectionDelayEnabledCheckbox: false // Ensure the checkbox is disabled
  }
  render(<Form form={formRef.current}>
    <GatewayConnectionSettings
      initIpSecData={customizedValue}
      loadGwSettings
      setLoadGwSettings={jest.fn()} /></Form>)
  expect(screen.getByText('Dead Peer Detection Delay')).toBeInTheDocument()

  // Check if the dpd delay element is not visible
  const dpdDelayElement = screen.queryByTestId('advOpt-dpdDelay')
  expect(dpdDelayElement).not.toBeInTheDocument()

  // Enable the checkbox
  const dpdDelayEnabledCheckbox = screen
    .getByTestId('deadPeerDetectionDelayEnabled') as HTMLInputElement
  fireEvent.click(dpdDelayEnabledCheckbox)
  expect(dpdDelayEnabledCheckbox.checked).toBe(true)

  // Verify the value of the InputNumber
  const dpdDelayAfterClick = screen.getByTestId('advOpt-dpdDelay')
  expect(dpdDelayAfterClick).toBeInTheDocument()
  const dpdDelayInput = dpdDelayAfterClick.querySelector('input')
  expect(Number(dpdDelayInput!.value)).toBe(30) // Check if the default value is set correctly
})

it('renders disabled keep alive interval and enable with default value', () => {
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })
  let advancedOption = {
    dhcpOpt43Subcode: 1,
    retryLimit: 1,
    replayWindow: 1,
    ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
    enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
    dpdDelay: 1,
    keepAliveInterval: 0, // default disable values
    failoverRetryPeriod: 1,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1
  }
  let customizedValue = {
    id: 'testId',
    name: 'testName',
    authType: IpSecAuthEnum.PSK,
    advancedOption: advancedOption,
    deadPeerDetectionDelayEnabledCheckbox: false // Ensure the checkbox is disabled
  }
  render(<Form form={formRef.current}>
    <GatewayConnectionSettings
      initIpSecData={customizedValue}
      loadGwSettings
      setLoadGwSettings={jest.fn()} /></Form>)
  expect(screen.getByText('NAT-T Keep Alive Interval')).toBeInTheDocument()

  // Check if the keep alive element is not visible
  const keepAliveElement = screen.queryByTestId('advOpt-keepAliveInterval')
  expect(keepAliveElement).not.toBeInTheDocument()

  // Enable the checkbox
  const keepAliveEnabledCheckbox = screen
    .getByTestId('nattKeepAliveIntervalEnabled') as HTMLInputElement
  fireEvent.click(keepAliveEnabledCheckbox)
  expect(keepAliveEnabledCheckbox.checked).toBe(true)

  // Verify the value of the InputNumber
  const keepAliveAfterClick = screen.getByTestId('advOpt-keepAliveInterval')
  expect(keepAliveAfterClick).toBeInTheDocument()
  const keepAliveInput = keepAliveAfterClick.querySelector('input')
  expect(Number(keepAliveInput!.value)).toBe(20) // Check if the default value is set correctly
})
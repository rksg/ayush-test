import { IpSecAdvancedOptionEnum }   from '@acx-ui/rc/utils'
import { render, fireEvent, screen } from '@acx-ui/test-utils'

import GatewayConnectionSettings from './GatewayConnectionSettings'

describe('GatewayConnectionSettings', () => {
  it('renders with no props', () => {
    render(<GatewayConnectionSettings />)
    expect(screen.getByText('Gateway')).toBeInTheDocument()
  })

  it('renders with initIpSecData prop', () => {
    const initIpSecData = {
      advancedOption: {
        ipcompEnable: true,
        enforceNatt: true
      }
    }
    render(<GatewayConnectionSettings initIpSecData={initIpSecData} />)
    expect(screen.getByText('IP Compression')).toBeInTheDocument()
    expect(screen.getByText('Force NAT-T')).toBeInTheDocument()
  })

  it('toggles retry limit checkbox', () => {
    render(<GatewayConnectionSettings />)
    const retryLimitEnabledCheckbox = screen.getByTestId('retryLimitEnabled')
    expect(retryLimitEnabledCheckbox.checked).toBe(false)
    fireEvent.click(retryLimitEnabledCheckbox)
    expect(retryLimitEnabledCheckbox.checked).toBe(true)
  })

  it('toggles ESP replay window checkbox', () => {
    render(<GatewayConnectionSettings />)
    const espReplayWindowEnabledCheckbox = screen.getByTestId('espReplayWindowEnabled')
    expect(espReplayWindowEnabledCheckbox.checked).toBe(false)
    fireEvent.click(espReplayWindowEnabledCheckbox)
    expect(espReplayWindowEnabledCheckbox.checked).toBe(true)
  })

  it('toggles dead peer detection delay checkbox', () => {
    render(<GatewayConnectionSettings />)
    const deadPeerDetectionDelayEnabledCheckbox =
      screen.getByTestId('deadPeerDetectionDelayEnabled')
    expect(deadPeerDetectionDelayEnabledCheckbox.checked).toBe(false)
    fireEvent.click(deadPeerDetectionDelayEnabledCheckbox)
    expect(deadPeerDetectionDelayEnabledCheckbox.checked).toBe(true)
  })

  it('toggles NAT-T keep alive interval checkbox', () => {
    render(<GatewayConnectionSettings />)
    const nattKeepAliveIntervalEnabledCheckbox = screen.getByTestId('nattKeepAliveIntervalEnabled')
    expect(nattKeepAliveIntervalEnabledCheckbox.checked).toBe(false)
    fireEvent.click(nattKeepAliveIntervalEnabledCheckbox)
    expect(nattKeepAliveIntervalEnabledCheckbox.checked).toBe(true)
  })

  it('toggles IP compression switch', () => {
    const initIpSecData = {
      advancedOption: {
        ipcompEnable: IpSecAdvancedOptionEnum.DISABLED,
        enforceNatt: IpSecAdvancedOptionEnum.DISABLED
      }
    }
    render(<GatewayConnectionSettings initIpSecData={initIpSecData}/>)
    const ipCompressionSwitch = screen.getByText('IP Compression')
    expect(ipCompressionSwitch.checked).toBe(false)
    fireEvent.click(ipCompressionSwitch)
    // await userEvent.click(select)
    expect(ipCompressionSwitch.checked).toBe(true)
  })

  it('toggles force NAT-T switch', () => {
    render(<GatewayConnectionSettings />)
    const forceNATTSwitch = screen.getByText('Force NAT-T')
    expect(forceNATTSwitch.checked).toBe(false)
    fireEvent.click(forceNATTSwitch)
    expect(forceNATTSwitch.checked).toBe(true)
  })

  it('updates input number fields', () => {
    render(<GatewayConnectionSettings />)
    const retryLimitInput = screen.getByTestId('retryLimit')
    const espReplayWindowInput = screen.getByTestId('replayWindow')
    const deadPeerDetectionDelayInput = screen.getByTestId('dpdDelay')
    const nattKeepAliveIntervalInput = screen.getByTestId('keepAliveInterval')

    fireEvent.change(retryLimitInput, { target: { value: 10 } })
    expect(retryLimitInput.value).toBe('10')

    fireEvent.change(espReplayWindowInput, { target: { value: 20 } })
    expect(espReplayWindowInput.value).toBe('20')

    fireEvent.change(deadPeerDetectionDelayInput, { target: { value: 30 } })
    expect(deadPeerDetectionDelayInput.value).toBe('30')

    fireEvent.change(nattKeepAliveIntervalInput, { target: { value: 40 } })
    expect(nattKeepAliveIntervalInput.value).toBe('40')
  })
})
import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { render, fireEvent, screen } from '@acx-ui/test-utils'

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
import { Form } from 'antd'

import { createStepsFormContext } from '@acx-ui/components'
import { render, screen }         from '@acx-ui/test-utils'

import { AuthenticationMethod, Band, ClientType, NetworkHealthFormDto, TestType } from '../types'

import { NetworkHealthFormSummary } from './NetworkHealthFormSummary'

const renderForm = (initialValues: NetworkHealthFormDto) => {
  const Context = createStepsFormContext()
  const Wrapper = (props: React.PropsWithChildren) => {
    const [form] = Form.useForm()
    const editMode = false
    const value = { form, editMode, initialValues, current: 1 }
    return <Context.Provider {...{ value }}>
      <Form {...{ form, initialValues }} {...props} />
    </Context.Provider>
  }

  render(<NetworkHealthFormSummary />, { wrapper: Wrapper })
}

describe('NetworkHealthFormSummary', () => {
  const dto = {
    id: 'spec-id',
    isDnsServerCustom: true,
    dnsServer: '10.10.10.11',
    tracerouteAddress: '10.10.10.12',
    pingAddress: '10.10.10.13',
    wlanName: 'WLAN Name',
    clientType: ClientType.VirtualWirelessClient,
    radio: Band.Band6,
    authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE,
    wlanPassword: '12345',
    wlanUsername: 'wifi user',
    type: TestType.OnDemand,
    name: 'Test Name',
    speedTestEnabled: true,
    networkPaths: { networkNodes: '' }
  }

  it('renders wlanUsername field if needed', async () => {
    renderForm(dto)

    expect(screen.getByText('wifi user')).toBeVisible()
  })

  it('renders wlanPassword field if needed', async () => {
    renderForm(dto)

    expect(screen.getByText('*****')).toBeVisible()
  })

  it('handle auth method without username and passworkd', () => {
    renderForm({ ...dto, authenticationMethod: AuthenticationMethod.OPEN_AUTH })

    expect(screen.getByText('Open Network')).toBeVisible()
  })

  it('renders custom dnsServer value', async () => {
    renderForm(dto)

    expect(screen.getByText('10.10.10.11')).toBeVisible()
  })

  it('renders enable/disabled for speed test', async () => {
    renderForm(dto)

    expect(screen.getByText('Enabled')).toBeVisible()
  })
})

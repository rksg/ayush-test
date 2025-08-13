import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { softGreApi }             from '@acx-ui/rc/services'
import { Provider, store }        from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook
} from '@acx-ui/test-utils'


import { DhcpOption82Settings }          from './DhcpOption82Settings'
import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'

describe('DhcpOption82Settings', () => {
  const mockReqVenueData = jest.fn()
  const mockReqAPData = jest.fn()

  beforeEach(() => {
    mockReqVenueData.mockReset()
    mockReqAPData.mockReset()
    store.dispatch(softGreApi.util.resetApiState())

  })

  it('Should be disabled under readonly', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            readOnly={true}
          />
        </Form>
      </Provider>)
    expect(await screen.findByTestId('dhcpoption82-switch-toggle')).toBeDisabled()
  })

  it('Should render correctly with sourceData (Venue level)', async () => {
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]
    form.setFieldsValue({
      lan: [{
        dhcpOption82: {
          dhcpOption82Enabled: true
        }
      }]
    })

    render(
      <Provider>
        <Form form={form}>
          <DhcpOption82Settings
            index={0}
            readOnly={false}
          />
        </Form>
      </Provider>)

    const switchElement = await screen.findByTestId('dhcpoption82-switch-toggle')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeChecked()

    expect(screen.getByTestId('dhcp82toption-icon')).toBeInTheDocument()
  })

  it('Should render correctly with sourceData containing disabled DHCP Option 82', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            readOnly={false}
          />
        </Form>
      </Provider>)

    const switchElement = await screen.findByTestId('dhcpoption82-switch-toggle')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()

    expect(screen.queryByTestId('dhcp82toption-icon')).not.toBeInTheDocument()
  })

  it('Should store the current settings and apply them when the drawer is opened', async () => {
    // mock onchange function
    const mockedOnChanged = jest.fn()
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            readOnly={false}
            onGUIChanged={mockedOnChanged}
          />
        </Form>
      </Provider>
    )

    // Click the switch to enable DHCP Option 82
    const switchElement = await screen.findByTestId('dhcpoption82-switch-toggle')
    fireEvent.click(switchElement)

    // Check the dawer title displayed
    expect(screen.getByText('DHCP Option 82 Sub Options')).toBeInTheDocument()

    // Click the apply button
    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)

    // Check if the settings are applied
    expect(switchElement).toBeChecked()
    expect(mockedOnChanged).toHaveBeenCalled()
  })

  it('Should resetFields when click Cancel button', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            readOnly={false}
          />
        </Form>
      </Provider>
    )

    // Click the switch to enable DHCP Option 82
    const switchElement = await screen.findByTestId('dhcpoption82-switch-toggle')
    fireEvent.click(switchElement)

    // Check the dawer title displayed
    expect(screen.getByText('DHCP Option 82 Sub Options')).toBeInTheDocument()

    // Click the close button
    const closeButton = screen.getByText('Cancel')
    fireEvent.click(closeButton)

    // Check if the settings are reset
    expect(switchElement).not.toBeChecked()
  })
})

describe('DhcpOption82SettingsFormField', () => {
  it('Should render basic form fields correctly', () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82SettingsFormField
          />
        </Form>
      </Provider>
    )

    // Check if main form elements are rendered
    expect(screen.getByText('Agent Circuit ID (#1)')).toBeInTheDocument()
    expect(screen.getByText('Agent Remote ID (#2)')).toBeInTheDocument()
    expect(screen.getByText('DHCPv4 Virtual Subnet Selection (#150)')).toBeInTheDocument()
    expect(screen.getByText('DHCPv4 Virtual Subnet Selection Control (#151)')).toBeInTheDocument()
  })

  it('Should render with lanport context and show custom attributes', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
    render(
      <Provider>
        <Form>
          <DhcpOption82SettingsFormField
            isLanPortSettings={true}
            readOnly={false}
          />
        </Form>
      </Provider>
    )

    // click on the format dropdown and select "Custom"
    const formatSelect = screen.getAllByRole('combobox')[0]
    fireEvent.mouseDown(formatSelect)

    // Wait for dropdown to appear and select "Custom" option
    const customOption = await screen.findByText('Custom')
    fireEvent.click(customOption)

    // Check if custom attributes section is rendered for lanport context
    expect(screen.getByText('Custom Attributes')).toBeInTheDocument()
    expect(screen.getByText('Select attribute from the list or input custom attribute.'))
      .toBeInTheDocument()
  })

  it('Should display DraggableTagField when lanport context is provided', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
    render(
      <Provider>
        <Form>
          <DhcpOption82SettingsFormField
            isLanPortSettings={true}
            readOnly={false}
          />
        </Form>
      </Provider>
    )

    // click on the format dropdown and select "Custom"
    const formatSelect = screen.getAllByRole('combobox')[0]
    fireEvent.mouseDown(formatSelect)

    // Wait for dropdown to appear and select "Custom" option
    const customOption = await screen.findByText('Custom')
    fireEvent.click(customOption)

    // Now check if DraggableTagField is rendered
    expect(screen.getByText('Custom Attributes')).toBeInTheDocument()
    expect(screen.getByText(
      'Select attribute from the list or input custom attribute.'
    )).toBeInTheDocument()
  })

  it('Should be disabled when readonly is true', () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82SettingsFormField
            readOnly={true}
          />
        </Form>
      </Provider>
    )

    // Check if switches are disabled
    const switches = screen.getAllByRole('switch')
    switches.forEach(switchElement => {
      expect(switchElement).toBeDisabled()
    })
  })

  it('Form init with suboption 1 custom value should display the display name', async () => {
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    form.setFieldsValue({
      subOption1Enabled: true,
      subOption1Format: 'CUSTOMIZED',
      subOption1Customization: {
        attributes: [
          { type: 'INTERFACE' },
          { type: 'VLAN' },
          { type: 'USER_DEFINED', text: 'Custom Value' }
        ]
      }
    })

    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE
    )

    render(
      <Provider>
        <Form form={form}>
          <DhcpOption82SettingsFormField
            isLanPortSettings={true}
            readOnly={false}
          />
        </Form>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Custom Attributes')).toBeInTheDocument()
    })
    expect(screen.getByText('Custom Value')).toBeInTheDocument()
    expect(screen.getByText('IF-Name')).toBeInTheDocument()
    expect(screen.getByText('VLAN ID')).toBeInTheDocument()

    userEvent.click(await screen.findByTestId('add-tag'))
    const opt2 = await screen.findAllByText(/ESSID/)
    await userEvent.click(opt2[1])
    expect((await screen.findByText(/ESSID/))).toBeVisible()

  })
})

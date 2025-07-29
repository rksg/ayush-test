import '@testing-library/jest-dom'
import { Form } from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { softGreApi }             from '@acx-ui/rc/services'
import { Provider, store }        from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import {
  mockSourceDataEnabled,
  mockSourceDataDisabled
} from './__tests__/fixture'
import { DhcpOption82Settings }          from './DhcpOption82Settings'
import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'

describe('DhcpOption82Settings', () => {
  const mockReqVenueData = jest.fn()
  const mockReqAPData = jest.fn()
  const venueId = 'bad700975bbb42c1b8c7e5cdb764dfb6'
  const portId = '1'
  const apModel = 'H320'
  const serialNumber = '123456'

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
            isUnderAPNetworking={true}
            venueId={venueId}
            portId={portId}
            serialNumber={serialNumber}
            readonly={true}
          />
        </Form>
      </Provider>)
    expect(await screen.findByTestId('dhcpoption82-switch-toggle')).toBeDisabled()
  })

  it('Should render correctly with sourceData (Venue level)', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            isUnderAPNetworking={false}
            venueId={venueId}
            portId={portId}
            apModel={apModel}
            readonly={false}
            sourceData={mockSourceDataEnabled}
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
            isUnderAPNetworking={false}
            venueId={venueId}
            portId={portId}
            apModel={apModel}
            readonly={false}
            sourceData={mockSourceDataDisabled}
          />
        </Form>
      </Provider>)

    const switchElement = await screen.findByTestId('dhcpoption82-switch-toggle')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()

    expect(screen.queryByTestId('dhcp82toption-icon')).not.toBeInTheDocument()
  })

  it('Should store the current settings and apply them when the drawer is opened', async () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82Settings
            index={1}
            isUnderAPNetworking={false}
            venueId={venueId}
            portId={portId}
            apModel={apModel}
            readonly={false}
            sourceData={mockSourceDataDisabled}
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
  })
})

describe('DhcpOption82SettingsFormField', () => {
  it('Should render basic form fields correctly', () => {
    render(
      <Provider>
        <Form>
          <DhcpOption82SettingsFormField
            readonly={false}
            onGUIChanged={jest.fn()}
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
            context='lanport'
            index={0}
            readonly={false}
            onGUIChanged={jest.fn()}
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
            context='lanport'
            index={0}
            readonly={false}
            onGUIChanged={jest.fn()}
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
            readonly={true}
            onGUIChanged={jest.fn()}
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

  it('Should call onGUIChanged when form fields change', async () => {
    const mockOnGUIChanged = jest.fn()

    render(
      <Provider>
        <Form>
          <DhcpOption82SettingsFormField
            readonly={false}
            onGUIChanged={mockOnGUIChanged}
          />
        </Form>
      </Provider>
    )

    // Find and click the first switch
    const firstSwitch = screen.getByTestId('dhcpOption82SubOption1-switch')
    fireEvent.click(firstSwitch)

    // Verify onGUIChanged was called
    expect(mockOnGUIChanged).toHaveBeenCalledWith('DHCPOption82Settings')
  })
})

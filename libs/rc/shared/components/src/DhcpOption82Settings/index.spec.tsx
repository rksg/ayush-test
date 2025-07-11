import '@testing-library/jest-dom'
import { Form } from 'antd'

import { softGreApi }      from '@acx-ui/rc/services'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockSourceDataEnabled,
  mockSourceDataDisabled
} from './__tests__/fixture'
import { DhcpOption82Settings } from './DhcpOption82Settings'

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
})

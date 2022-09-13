import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }          from '@acx-ui/store'
import { fireEvent, within } from '@acx-ui/test-utils'
import { render, screen }    from '@acx-ui/test-utils'

import { NetworkMoreSettingsForm } from './NetworkMoreSettingsForm'

const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: []
}

describe('NetworkMoreSettingsForm', () => {
  it('should render More settings form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should visible VLAN pooling', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/vlan pooling:/i)
    await userEvent.click(within(view).getByRole('switch'))
    await userEvent.click(screen.getByRole('combobox', {
      name: /vlan pool:/i
    }))
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('after click Client Isolation', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/client isolation:/i)
    await userEvent.click(within(view).getByRole('switch'))

    expect(screen.getByText(/automatic support for vrrp\/hsrp:/i)).toBeVisible()
    expect(screen.getByText(/client isolation allowlist by venue:/i)).toBeVisible()
  })

  it('after click Anti-spoofing', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/anti\-spoofing:/i)
    await userEvent.click(within(view).getByRole('switch'))

    expect(screen.getByText(/arp request rate limit/i)).toBeVisible()
    expect(screen.getByText(/dhcp request rate limit/i)).toBeVisible()


  })

  it('after click Access Control', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const layer2 = screen.getByText(/layer 2/i)
    await userEvent.click(within(layer2).getByRole('switch'))
    await userEvent.click(within(layer2).getByRole('combobox'))
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(layer2).getByRole('switch'))

    const layer3 = screen.getByText(/layer 3/i)
    await userEvent.click(within(layer3).getByRole('switch'))
    await userEvent.click(within(layer3).getByRole('combobox'))
    expect(within(layer3).getByText(/add/i)).toBeVisible()
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(layer3).getByRole('switch'))

    const deviceOs = screen.getByText(/device & os/i)
    await userEvent.click(within(deviceOs).getByRole('switch'))
    await userEvent.click(within(deviceOs).getByRole('combobox'))
    expect(within(deviceOs).getByText(/add/i)).toBeVisible()
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(deviceOs).getByRole('switch'))

    const applications = screen.getByText(/applications/i)
    await userEvent.click(within(applications).getByRole('switch'))
    await userEvent.click(within(applications).getByRole('combobox'))
    expect(within(applications).getByText(/add/i)).toBeVisible()
    expect(screen.getByText('No Data')).toBeInTheDocument()
    await userEvent.click(within(applications).getByRole('switch'))

    const clientRateLimit = screen.getByText(/client rate limit/i)
    await userEvent.click(within(clientRateLimit).getByRole('switch'))
    expect(screen.getByText(/upload limit/i)).toBeVisible()
    expect(screen.getByText(/download limit/i)).toBeVisible()

    const uploadLimitCheckbox = screen.getByTestId('enableUploadLimit')
    await userEvent.click(uploadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(uploadLimitCheckbox)

    const downloadLimitCheckbox = screen.getByTestId('enableDownloadLimit')
    await userEvent.click(downloadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(downloadLimitCheckbox)

  })


  it('aaa type wlan', async () => {
    const mockDpskWlanData = {
      name: 'test',
      type: 'aaa',
      isCloudpathEnabled: false,
      venues: []
    }
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <NetworkMoreSettingsForm wlanData={mockDpskWlanData} />
        </Form>
      </Provider>,
      { route: { params } })


    const enableFastRoamingCheckbox = screen.getByTestId('enableFastRoaming')
    fireEvent.click(enableFastRoamingCheckbox)
    expect(screen.getByText(/mobility domain id/i)).toBeVisible()


  })
})


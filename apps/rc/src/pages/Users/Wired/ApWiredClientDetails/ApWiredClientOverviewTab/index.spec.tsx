import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useApWiredClientContext } from '../ApWiredClientContextProvider'

import ApWiredClientOverviewTab from '.'


const mockClientInfo = {
  apId: '212339000531',
  apName: 'Kyle\'s AP v2',
  apMacAddress: 'c8:a6:08:14:0f:40',
  portNumber: '1',
  macAddress: '68:05:ca:55:7a:b0',
  ipAddress: '10.206.78.252',
  deviceType: 'VoIP',
  authStatus: 1,
  vlanId: '1',
  hostname: 'kyle-All-Series',
  osType: 'Linux',
  venueName: 'My-Venue',
  venueId: 'c33f6e8b25a8404a907fc6b2e764fa24'
}

const mockClientInfo1 = {
  authStatus: 0,
  hostname: 'kyle-All-Series'
}

const mockClientInfo2 = {
  authStatus: -1,
  hostname: 'kyle-All-Series'
}

jest.mock('../ApWiredClientContextProvider', () => ({
  useApWiredClientContext: jest.fn()
}))


describe('AP Wired Client Details - Overview tab', () => {
  const params = {
    tenantId: 'tenant-id',
    clientId: 'user-id',
    activeTab: 'overview'
  }

  it('should render Ap wired client overview', async () => {
    (useApWiredClientContext as jest.Mock).mockReturnValue({
      clientInfo: mockClientInfo
    })
    render(
      <MemoryRouter>
        <ApWiredClientOverviewTab />
      </MemoryRouter>
    )
    expect(await screen.findByText('Client Details')).toBeVisible()
    //MAC Address
    expect(await screen.findByText('MAC Address')).toBeVisible()
    expect(await screen.findByText('68:05:ca:55:7a:b0')).toBeVisible()
    //OS
    expect(await screen.findByText('OS')).toBeVisible()
    expect(await screen.findByText('Linux')).toBeVisible()
    //DeviceType
    expect(await screen.findByText('Device Type')).toBeVisible()
    expect(await screen.findByText('VoIP')).toBeVisible()
    //Auth Status
    expect(await screen.findByText('Auth Status')).toBeVisible()
    expect(await screen.findByText('Authorized')).toBeVisible()
    //Connection
    expect(await screen.findByText('Connection')).toBeVisible()
    //AP
    expect(await screen.findByText('AP')).toBeVisible()
    expect(await screen.findByText('Kyle\'s AP v2')).toBeVisible()
    //Port
    expect(await screen.findByText('Port')).toBeVisible()
    expect(await screen.findByText('LAN 1')).toBeVisible()
    //Venue
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('My-Venue')).toBeVisible()
    //VLAN
    expect(await screen.findByText('VLAN')).toBeVisible()
    expect(await screen.findByText('1')).toBeVisible()
  })

  it('should render Ap wired client overview with some data are miss', async () => {
    (useApWiredClientContext as jest.Mock).mockReturnValue({
      clientInfo: mockClientInfo1
    })

    render(<Provider><ApWiredClientOverviewTab /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wired/wifi/clients/:clientId/details/:activeTab' }
    })

    expect(await screen.findByText('Unauthorized')).toBeVisible()
  })

  it('should render Ap wired client overview with authStatus is -1 data', async () => {
    (useApWiredClientContext as jest.Mock).mockReturnValue({
      clientInfo: mockClientInfo2
    })

    render(<Provider><ApWiredClientOverviewTab /></Provider>, {
      route: { params, path: '/:tenantId/t/users/wired/wifi/clients/:clientId/details/:activeTab' }
    })

    expect(await screen.findByText('N/A')).toBeVisible()
  })
})

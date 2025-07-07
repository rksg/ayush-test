import { Provider, dataApiURL } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockGraphqlQuery
} from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import ClientDetails from '.'

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: () => true
}))

const mockedUsedNavigate = jest.fn()
const mockedTenantLink = {
  hash: '',
  pathname: '/users/wifi/clients/mockClientId/details',
  search: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: () => mockedTenantLink
}))

jest.mock('./ClientTroubleshooting', () => ({
  ClientTroubleshootingTab: () => <div data-testid='troubleshooting'></div>
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid='report'></div>
}))

describe('ClientDetails', () => {
  const params = {
    clientId: 'mockClientId',
    activeTab: 'reports'
  }
  const clientsList = {
    network: {
      search: {
        clientsByTraffic: [
          {
            hostname: '02AA01AB50120H4M',
            username: '18b43003e603',
            mac: '18:B4:30:03:E6:03',
            osType: 'Nest Learning Thermostat',
            ipAddress: '10.0.1.42',
            lastSeen: '2023-08-23T05:08:20.000Z',
            traffic: 1
          }
        ]
      }
    }
  }
  beforeEach(() => {
    setRaiPermissions({
      READ_WIRELESS_CLIENTS_REPORT: true,
      READ_CLIENT_TROUBLESHOOTING: true
    } as RaiPermissions)
  })
  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params,
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByText('mockClientId (02AA01AB50120H4M)')).toBeVisible()
    expect(await screen.findByText('Troubleshooting')).toBeVisible()
    expect(await screen.findByText('Reports')).toBeVisible()
    fireEvent.click(await screen.findByRole('tab', { name: 'Troubleshooting' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/users/wifi/clients/${params.clientId}/details/troubleshooting`,
      hash: '',
      search: ''
    })
  })
  it('should handle when hostname is undefined', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          search: {
            clients: []
          }
        }
      }
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params,
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByText('mockClientId')).toBeVisible()
  })
  it('should render with reports correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'reports'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Reports', selected: true })).toBeVisible()
  })

  it('should render client troubleshooting correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'troubleshooting'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Troubleshooting', selected: true }))
      .toBeVisible()
    expect(await screen.findByTestId('troubleshooting')).toBeVisible()
  })

  it('should render for BI (previous report-only) user correctly', async () => {
    setRaiPermissions({
      READ_CLIENT_TROUBLESHOOTING: true,
      READ_WIRELESS_CLIENTS_REPORT: true
    } as RaiPermissions)
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'reports'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Troubleshooting' })).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Reports' })).toBeVisible()
  })
  it('should not render tabs for reports user', async () => {
    setRaiPermissions({
      READ_CLIENT_TROUBLESHOOTING: false,
      READ_WIRELESS_CLIENTS_REPORT: false
    } as RaiPermissions)
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'reports'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(screen.queryByRole('tab', { name: 'Troubleshooting' })).toBeNull()
    expect(screen.queryByRole('tab', { name: 'Reports' })).toBeNull()
  })
  it('should not render tabs for a single tab with troubleshooting permission', async () => {
    setRaiPermissions({
      READ_CLIENT_TROUBLESHOOTING: true,
      READ_WIRELESS_CLIENTS_REPORT: false
    } as RaiPermissions)
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'troubleshooting'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(screen.queryByRole('tab', { name: 'Troubleshooting' })).toBeNull()
    expect(screen.queryByRole('tab', { name: 'Reports' })).toBeNull()
  })
  it('should not render tabs for a single tab with client report permission', async () => {
    setRaiPermissions({
      READ_CLIENT_TROUBLESHOOTING: false,
      READ_WIRELESS_CLIENTS_REPORT: true
    } as RaiPermissions)
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'reports'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(screen.queryByRole('tab', { name: 'Troubleshooting' })).toBeNull()
    expect(screen.queryByRole('tab', { name: 'Reports' })).toBeNull()
  })
})

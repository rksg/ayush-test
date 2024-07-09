import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import ZoneDetails from '.'

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('../Wifi/ApsTable', () => {
  return {
    __esModule: true,
    APList: () => <div data-testid='zoneWiseApList' />
  }
})
jest.mock('../WifiNetworks/NetworksTable', () => {
  return {
    __esModule: true,
    NetworkList: () => <div data-testid='zoneWiseNetworkList' />
  }
})
jest.mock('../Clients/ClientsList', () => {
  return {
    __esModule: true,
    ClientsList: () => <div data-testid='zoneClientsList' />
  }
})
describe('ZoneDetails', () => {
  it('should render correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'assurance'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
  })
  it('should render default tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'awrongtab'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
  })
  it('should render clients tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'clients'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByTestId('zoneClientsList')).toBeVisible()
  })
  it('should render devices tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'devices'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByTestId('zoneWiseApList')).toBeVisible()
  })
  it('should render networks tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'networks'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByTestId('zoneWiseNetworkList')).toBeVisible()
  })
  it('should render navigate tabs correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'assurance'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    const tab = await screen.findByText('Networks')
    fireEvent.click(tab)
    expect(await screen.findByTestId('zoneWiseNetworkList')).toBeVisible()
  })
})


import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }                           from '@acx-ui/user'

import { ClientsList } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath
}))

export const clientsList = {
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
          manufacturer: 'manufacturer1',
          traffic: 1
        },
        {
          hostname: '02AA01AB50120E2Q',
          username: '18b43004d810',
          mac: '18:B4:30:04:D8:10',
          osType: 'Nest Learning Thermostat',
          ipAddress: '10.0.1.44',
          lastSeen: '2023-08-23T05:07:23.000Z',
          manufacturer: 'manufacturer2',
          traffic: 1
        },
        {
          hostname: '02AA01AB50120G7G',
          username: '18b430051cbe',
          mac: '18:B4:30:05:1C:BE',
          osType: 'Nest Learning Thermostat',
          ipAddress: '10.0.1.69',
          lastSeen: '2023-08-23T05:07:23.000Z',
          manufacturer: 'manufacturer3',
          traffic: 1
        }
      ]
    }
  }
}
export const emptyClientsList = {
  network: {
    search: {
      clientsByTraffic: []
    }
  }
}

describe('Clients List', () => {
  beforeEach(() => {
    setRaiPermissions({ READ_CLIENT_TROUBLESHOOTING: true } as RaiPermissions)
  })

  it('should render table correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientsList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('02AA01AB50120H4M')).toBeVisible()
    expect(screen.getByText('18b43004d810')).toBeVisible()
    expect(screen.getByText('18:B4:30:05:1C:BE')).toBeVisible()
    expect(screen.getByText('manufacturer3')).toBeVisible()
  })
  it('should render table with zone filter correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    const zoneQuery = {
      path: [[{ type: 'zone' as const, name: 'zone' }]]
    }
    render(<ClientsList queryParmsForZone={zoneQuery}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('02AA01AB50120H4M')).toBeVisible()
    expect(screen.getByText('18b43004d810')).toBeVisible()
    expect(screen.getByText('18:B4:30:05:1C:BE')).toBeVisible()
    expect(screen.getByText('manufacturer3')).toBeVisible()
  })
  it('should show no data on empty list', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: emptyClientsList
    })
    const { container } = render(<ClientsList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ant-table-expanded-row-fixed')).toHaveLength(1)
  })
  it('should trigger onSearch function', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientsList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    userEvent.click(
      await screen.findByPlaceholderText(
        'Search Hostname, Username, MAC Address, IP Address, Manufacturer, OS Type'
      )
    )
    userEvent.type(
      await screen.findByPlaceholderText(
        'Search Hostname, Username, MAC Address, IP Address, Manufacturer, OS Type'
      ),
      '18b43003e603'
    )
    expect(screen.getByText('02AA01AB50120H4M')).toBeVisible()
  })
  it('should correct links for report-only user', async () => {
    setRaiPermissions({ READ_CLIENT_TROUBLESHOOTING: false } as RaiPermissions)
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: clientsList
    })
    render(<ClientsList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const hostname = screen.getByText('02AA01AB50120H4M')
    expect(hostname).toBeVisible()
    const href = hostname.getAttribute('href')
    expect((href as string).includes('/details/reports'))
      .toBeTruthy()
  })
})

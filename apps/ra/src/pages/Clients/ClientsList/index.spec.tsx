import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiSearchURL }                                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ClientsList } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath
}))
export const clientsList = {
  search: {
    clients: [
      {
        hostname: '02AA01AB50120H4M',
        username: '18b43003e603',
        mac: '18:B4:30:03:E6:03',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.42',
        lastActiveTime: '2023-08-23T05:08:20.000Z'
      },
      {
        hostname: '02AA01AB50120E2Q',
        username: '18b43004d810',
        mac: '18:B4:30:04:D8:10',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.44',
        lastActiveTime: '2023-08-23T05:07:23.000Z'
      },
      {
        hostname: '02AA01AB50120G7G',
        username: '18b430051cbe',
        mac: '18:B4:30:05:1C:BE',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.69',
        lastActiveTime: '2023-08-23T05:07:23.000Z'
      }
    ]
  }
}
export const emptyClientsList = {
  search: {
    clients: []
  }
}

describe('Clients List', () => {

  it('should render table correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
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
  })

  it('should show no data on empty list', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
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
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
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
        'Search Hostname, Username, MAC Address, IP Address, OS Type'
      )
    )
    userEvent.type(
      await screen.findByPlaceholderText(
        'Search Hostname, Username, MAC Address, IP Address, OS Type'
      ),
      '18b43003e603'
    )
    expect(screen.getByText('02AA01AB50120H4M')).toBeVisible()
  })
})
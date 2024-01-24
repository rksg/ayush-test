import '@testing-library/jest-dom'
import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import Zones from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath
}))
export const zonesList = {
  network: {
    zones: [
      {
        systemName: 'systemName 1',
        domain: '1||Administration Domain',
        zoneName: 'zoneName 1',
        apCount: 1,
        clientCount: 2
      },
      {
        systemName: 'systemName 2',
        domain: 'domain 2',
        zoneName: 'zoneName 2',
        apCount: 1,
        clientCount: 2
      },
      {
        systemName: 'systemName 3',
        domain: '1||Administration Domain',
        zoneName: 'zoneName 3',
        apCount: 3,
        clientCount: 3
      }
    ]
  }
}
export const emptyZonesList = {
  network: {
    zones: []
  }
}

describe('Zones List', () => {
  it('should render table correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ZonesList', {
      data: zonesList
    })
    render(<Zones />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('zoneName 1')).toBeVisible()
    expect(screen.getByText('systemName 1')).toBeVisible()
  })

  it('should show no data on empty list', async () => {
    mockGraphqlQuery(dataApiURL, 'ZonesList', {
      data: emptyZonesList
    })
    const { container } = render(<Zones />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ant-table-expanded-row-fixed')).toHaveLength(1)
  })
})
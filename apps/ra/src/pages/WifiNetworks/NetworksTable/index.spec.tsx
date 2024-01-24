import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { wifiNetworksFixture, emptyListFixture } from './__tests__/fixtures'

import { NetworkList } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath
}))

describe('Network List', () => {
  it('should render table correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: wifiNetworksFixture
    })
    render(<NetworkList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByText('Hospt-Guest')).toBeVisible()
    expect(screen.getByText('DENSITY-WPA2PSK')).toBeVisible()
  })

  it('should show no data on empty list', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: emptyListFixture
    })
    const { container } = render(<NetworkList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ant-table-expanded-row-fixed')).toHaveLength(1)
  })

  it('should search for the specified text', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: wifiNetworksFixture
    })
    render(<NetworkList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const searchPlaceHolder = 'Search Name'
    await userEvent.click(
      await screen.findByPlaceholderText(searchPlaceHolder)
    )
    userEvent.type(
      await screen.findByPlaceholderText(searchPlaceHolder),
      'DENSITY'
    )
    expect(screen.getByText('DENSITY-WPA2PSK')).toBeVisible()
  })
})
describe('Zone wise Network List Table', () => {

  it('should render the ap table correctly for Zone wise APs', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: wifiNetworksFixture
    })
    render(<NetworkList queryParamsForZone={{ path: [] }} />,
      { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText('DENSITY-WPA2PSK')).toBeVisible()
  })

})

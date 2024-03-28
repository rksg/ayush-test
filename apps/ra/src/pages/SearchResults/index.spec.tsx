import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { getUserProfile }                                                       from '@acx-ui/analytics/utils'
import { useIsSplitOn }                                                         from '@acx-ui/feature-toggle'
import { Provider, dataApiSearchURL }                                           from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, cleanup } from '@acx-ui/test-utils'

import { searchFixture, emptySearchFixture } from './__fixtures__/searchMocks'

import SearchResults from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn(),
  updateSelectedTenant: jest.fn()
}))
const userProfile = getUserProfile as jest.Mock

const params = { searchVal: 'test%3F' }
describe.only('Search Results', () => {
  const defaultUserProfile = {
    accountId: 'aid',
    tenants: [],
    invitations: [],
    selectedTenant: {
      id: 'aid',
      role: 'admin'
    }
  }
  beforeEach(() => {
    userProfile.mockReturnValue(defaultUserProfile)
    cleanup()
  })
  it('should decode search string correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    render(<SearchResults />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('Search Results for "test?" (13)')).toBeVisible()
  })

  it('should render tables correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('APs (3)')).toBeVisible()
    expect(screen.getByText('Clients (3)')).toBeVisible()
    expect(screen.getByText('manufacturer-1')).toBeVisible()
    expect(screen.getByText('Switches (1)')).toBeVisible()
    expect(screen.getByText('Network Hierarchy (4)')).toBeVisible()
    expect(screen.getByText('Wi-Fi Networks (2)')).toBeVisible()
  })

  it('should render empty result correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: emptySearchFixture
    })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    const header =
      await screen.findByText(/Hmmmm... we couldn’t find any match for "some text"/i)
    expect(header).toBeInTheDocument()
  })
  it('should handle time range change', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('APs (3)')).toBeVisible()

    const menuSelected = await screen.findByText('Last 24 Hours')
    await userEvent.click(menuSelected)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Last 30 Days' }))
    expect(menuSelected).toHaveTextContent('Last 30 Days')
  })
  it('should handle isZonesPageEnabled feature flag correctly when true', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const link = screen.getAllByText('CDC_BB_TEST')[0]
    const href = link.getAttribute('href')
    expect(href).toBe('/ai/zones/Public-vSZ-2/CDC_BB_TEST/assurance')
  })
  it('should handle isZonesPageEnabled feature flag correctly when false', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const link = screen.getAllByText('CDC_BB_TEST')[0]
    const href = link.getAttribute('href')
    expect((href as string).includes('incidents?analyticsNetworkFilter')).toBeTruthy()
  })
  it('should handle results for report-only', async () => {
    userProfile.mockReturnValue({
      ...defaultUserProfile,
      selectedTenant: {
        ...defaultUserProfile.selectedTenant,
        role: 'report-only'
      }
    })
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: {
        search: {
          aps: searchFixture.search.aps,
          networkHierarchy: searchFixture.search.networkHierarchy,
          clients: searchFixture.search.clients
        }
      }
    })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const apLink = screen.getByText('AL-Guest-R610')
    const apHref = apLink.getAttribute('href')
    expect((apHref as string).includes('reports/aps?analyticsNetworkFilter')).toBeTruthy()

    const switchLink = screen.getAllByText('7450-zone')[0]
    const switchHref = switchLink.getAttribute('href')
    expect((switchHref as string).includes('reports/switches?analyticsNetworkFilter')).toBeTruthy()

    const clientLink = screen.getByText('02AA01AB50120H4M')
    const clientHref = clientLink.getAttribute('href')
    expect((clientHref as string).includes('/details/reports')).toBeTruthy()
  })
  it('should handle results for non report-only user', async () => {
    userProfile.mockReturnValue({
      ...defaultUserProfile,
      selectedTenant: {
        ...defaultUserProfile.selectedTenant,
        role: 'admin'
      }
    })
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: {
        search: {
          clients: searchFixture.search.clients
        }
      }
    })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const clientLink = screen.getByText('02AA01AB50120H4M')
    const clientHref = clientLink.getAttribute('href')
    expect((clientHref as string)
      // eslint-disable-next-line max-len
      .includes('/users/wifi/clients/18:B4:30:03:E6:03/details/troubleshooting?period=%7B%22startDate%22%3A%222023-08-23T01%3A08%3A20%2B00%3A00%22%2C%22endDate%22%3A%222023-08-23T09%3A08%3A20%2B00%3A00%22%2C%22range%22%3A%22Custom%22%7D'))
      .toBeTruthy()
  })
  it('should handle client results link when event time is closer to current time', async () => {
    const mockCurrentTime = new Date('2023-08-23T05:00:00Z').getTime()
    jest.spyOn(Date, 'now').mockImplementation(() => mockCurrentTime)
    userProfile.mockReturnValue({
      ...defaultUserProfile,
      selectedTenant: {
        ...defaultUserProfile.selectedTenant,
        role: 'admin'
      }
    })
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: {
        search: {
          clients: searchFixture.search.clients
        }
      }
    })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('some text') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const clientLink = screen.getByText('02AA01AB50120H4M')
    const clientHref = clientLink.getAttribute('href')
    expect((clientHref as string)
      // eslint-disable-next-line max-len
      .includes('/users/wifi/clients/18:B4:30:03:E6:03/details/troubleshooting?period=%7B%22startDate%22%3A%222023-08-23T01%3A08%3A20%2B00%3A00%22%2C%22endDate%22%3A%222023-08-23T05%3A00%3A00%2B00%3A00%22%2C%22range%22%3A%22Custom%22%7D'))
      .toBeTruthy()
  })
})

/* eslint-disable max-len */
import '@testing-library/jest-dom'

import {
  ClientUrlsInfo,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  SwitchRbacUrlsInfo,
  SwitchUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockRestApiQuery,
  render,
  screen,
  waitForElementToBeRemoved
}  from '@acx-ui/test-utils'

import {
  apListData,
  networkListData,
  venueListData,
  eventListData,
  eventMetaData,
  switchListData
} from './__fixtures__/searchMocks'

import SearchResults from '.'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: {
    detailLevel: 'it',
    dateFormat: 'mm/dd/yyyy'
  } })
}))

const params = { searchVal: 'test%3F', tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe('Search Results', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', venueListData)
    mockRestApiQuery(CommonRbacUrlsInfo.getWifiNetworksList.url, 'post', networkListData)
    mockRestApiQuery(CommonRbacUrlsInfo.getApsList.url, 'post', apListData)
    // for get the switch name from AP List data
    mockRestApiQuery(SwitchRbacUrlsInfo.getSwitchClientList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', eventListData)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventMetaData)
    mockRestApiQuery(SwitchRbacUrlsInfo.getSwitchList.url, 'post', switchListData)
    mockRestApiQuery(SwitchUrlsInfo.getSwitchList.url, 'post', switchListData)
    mockRestApiQuery(ClientUrlsInfo.getClients.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(SwitchUrlsInfo.getSwitchPortlist.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(SwitchUrlsInfo.getSwitchClientList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(WifiRbacUrlsInfo.getApGroupsList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(WifiRbacUrlsInfo.getWifiCapabilities.url, 'get', { data: [], totalCount: 0 })
    mockRestApiQuery(CommonUrlsInfo.getHistoricalClientList.url, 'post',
      { data: [], totalCount: 0 })
  })

  it('should decode search string correctly', async () => {
    render(<SearchResults />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('Search Results for "test?" (7)')).toBeVisible()
  })

  it('should render tables correctly', async () => {
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('bdcPerformanceVenue2') }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Venues (1)')).toHaveTextContent('Venues (1)')
    expect(screen.getByText('Networks (3)')).toHaveTextContent('Networks (3)')
    expect(screen.getByText('APs (1)')).toHaveTextContent('APs (1)')
    expect(screen.getByText('Events (1)')).toHaveTextContent('Events (1)')
  })

  it('should render empty result correctly', async () => {
    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', {
      status: 200,
      data: [],
      totalCount: 0
    })
    mockRestApiQuery(CommonRbacUrlsInfo.getWifiNetworksList.url, 'post', {
      data: [],
      totalCount: 0
    })
    mockRestApiQuery(CommonRbacUrlsInfo.getApsList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(SwitchRbacUrlsInfo.getSwitchList.url, 'post', { data: [], totalCount: 0 })
    render(<SearchResults />, {
      wrapper: Provider,
      route: {
        params: { ...params, searchVal: encodeURIComponent('bdcPerformanceVenue2') }
      }
    })
    const header =
      await screen.findByText(/Hmmmm... we couldn’t find any match for "bdcPerformanceVenue2"/i)
    expect(header).toBeInTheDocument()
  })

})

import '@testing-library/jest-dom'

import { ClientUrlsInfo, CommonUrlsInfo, SwitchUrlsInfo }              from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockRestApiQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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
    mockRestApiQuery(CommonUrlsInfo.getVMNetworksList.url, 'post', networkListData)
    mockRestApiQuery(CommonUrlsInfo.getApsList.url, 'post', apListData)
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', eventListData)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventMetaData)
    mockRestApiQuery(SwitchUrlsInfo.getSwitchList.url, 'post', switchListData)
    mockRestApiQuery(ClientUrlsInfo.getClientList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(ClientUrlsInfo.getClientMeta.url, 'post', {})
    mockRestApiQuery(SwitchUrlsInfo.getSwitchClientList.url, 'post', { data: [], totalCount: 0 })
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
    mockRestApiQuery(CommonUrlsInfo.getVMNetworksList.url, 'post', {
      data: [],
      totalCount: 0
    })
    mockRestApiQuery(CommonUrlsInfo.getApsList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', { data: [], totalCount: 0 })
    mockRestApiQuery(SwitchUrlsInfo.getSwitchList.url, 'post', { data: [], totalCount: 0 })
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

import '@testing-library/jest-dom'

import { CommonUrlsInfo, SwitchUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockRestApiQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  apListData,
  networkListData,
  switchListData,
  venueListData
} from './__fixtures__/searchMocks'

import SearchResults from '.'

const params = { searchVal: 'test%3F', tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe('Search Results', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', venueListData)
    mockRestApiQuery(CommonUrlsInfo.getVMNetworksList.url, 'post', networkListData)
    mockRestApiQuery(CommonUrlsInfo.getApsList.url, 'post', apListData)
    mockRestApiQuery(SwitchUrlsInfo.getSwitchList.url, 'post', switchListData)
  })

  it('should decode search string correctly', async () => {
    render(
      <Provider>
        <SearchResults />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Search Results for "test?" (6)')).toBeVisible()
  })

  it('should render tables correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <SearchResults />
      </Provider>,{
        route: {
          params: { ...params, searchVal: encodeURIComponent('bdcPerformanceVenue2') }
        }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach(element => element.removeAttribute('_echarts_instance_'))
    expect(fragment).toMatchSnapshot()
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
    mockRestApiQuery(SwitchUrlsInfo.getSwitchList.url, 'post', { data: [], totalCount: 0 })
    render(
      <Provider>
        <SearchResults />
      </Provider>,{
        route: {
          params: { ...params, searchVal: encodeURIComponent('bdcPerformanceVenue2') }
        }
      }
    )
    const header =
      await screen.findByText(/Hmmmm... we couldn't find any match for "bdcPerformanceVenue2"/i)
    expect(header).toBeInTheDocument()
  })
})

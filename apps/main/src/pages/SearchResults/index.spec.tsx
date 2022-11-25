import '@testing-library/jest-dom'

import { CommonUrlsInfo }                                              from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockRestApiQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  networkListData,
  venueListData,
  overViewData
} from './__fixtures__/searchMocks'

import SearchResults from '.'

const params = { searchVal: 'test%3F', tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe('Search Results', () => {
  beforeEach(async () => {
    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', {
      status: 200,
      data: venueListData
    })

    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', {
      status: 200,
      data: overViewData
    })

    mockRestApiQuery(CommonUrlsInfo.getVMNetworksList.url, 'post', {
      data: networkListData
    })
  })

  it('should render correctly', async () => {
    const { baseElement } = render(
      <Provider>
        <SearchResults />
      </Provider>,
      { route: { params } }
    )
    expect(baseElement).toHaveTextContent('Search Results')
  })

  it('should decode search string correctly', async () => {
    render(
      <Provider>
        <SearchResults />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Search Results for "test?" (0)')).toBeVisible()
  })

  it('should render venue table correctly', async () => {

    render(
      <Provider>
        <SearchResults />
      </Provider>,{
        route: {
          params: { ...params, searchVal: encodeURIComponent('bdcPerformanceVenue2') }
        }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('500')).toBeInTheDocument()
    const vlan1s = await screen.findAllByText(/VLAN-1/i)
    expect(vlan1s).toHaveLength(2)
  })
})

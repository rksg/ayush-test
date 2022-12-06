import '@testing-library/jest-dom'

import { CommonUrlsInfo }                                              from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockRestApiQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  apListData,
  networkListData,
  venueListData
} from './__fixtures__/searchMocks'

import SearchResults from '.'

const params = { searchVal: 'test%3F', tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe('Search Results', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', venueListData)
    mockRestApiQuery(CommonUrlsInfo.getVMNetworksList.url, 'post', networkListData)
    mockRestApiQuery(CommonUrlsInfo.getApsList.url, 'post', apListData)
  })

  it('should decode search string correctly', async () => {
    render(
      <Provider>
        <SearchResults />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Search Results for "test?" (5)')).toBeVisible()
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
})

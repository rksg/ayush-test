import '@testing-library/jest-dom'

import { Provider, dataApiSearchURL }                                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { searchFixture, emptySearchFixture } from './__fixtures__/searchMocks'


import SearchResults from '.'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({
    data: {
      detailLevel: 'it',
      dateFormat: 'mm/dd/yyyy'
    }
  })
}))

const params = { searchVal: 'test%3F', tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe.only('Search Results', () => {
  it('should decode search string correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    render(<SearchResults />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('Search Results for "test?" (10)')).toBeVisible()
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
    expect(screen.getByText('Switches (1)')).toBeVisible()
    expect(screen.getByText('Network Hierarchy (3)')).toBeVisible()
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
})

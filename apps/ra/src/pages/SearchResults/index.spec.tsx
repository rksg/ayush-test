import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiSearchURL }                                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { searchFixture, emptySearchFixture } from './__fixtures__/searchMocks'

import SearchResults from '.'

const params = { searchVal: 'test%3F' }

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
})

import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import SearchResults from '.'

const params = { searchVal: 'test%3F' }

describe('Search Results', () => {
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
    expect(screen.getByText('Search Results for "test?" (1)')).toBeVisible()
  })
})

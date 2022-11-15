import '@testing-library/jest-dom'

import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import SearchBar from './SearchBar'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Search Bar (feature enabled)', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(() => {
    mockedUsedNavigate.mockClear()
  })
  it('should trigger search on send click', async () => {
    render(<Provider>
      <SearchBar />
    </Provider>, {
      route: {
        path: '/t/:tenantId/dashboard',
        params: { tenantId: 't1' }
      }
    })
    const searchBtn = await screen.findByTestId('search-button')
    fireEvent.click(searchBtn)
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: '' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(mockedUsedNavigate).not.toHaveBeenCalled()
    fireEvent.change(searchInput, { target: { value: 'abc' } })
    fireEvent.click(screen.getByTestId('search-send'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t/t1/search/abc'
    )
    expect(mockedUsedNavigate.mock.calls[0][1].replace).toBeFalsy()
  })
  it('should trigger search on keyboard enter', async () => {
    render(<Provider>
      <SearchBar />
    </Provider>, {
      route: {
        path: '/t/:tenantId/search/:searchVal',
        params: { tenantId: 't1', searchVal: 'abc' }
      }
    })
    const searchInput = await screen.findByTestId('search-input')
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t/t1/search/abc'
    )
    expect(mockedUsedNavigate.mock.calls[0][1].replace).toBeTruthy()
    fireEvent.keyDown(searchInput, { key: 'Esc' })
    expect(mockedUsedNavigate).toHaveBeenCalledTimes(1)
  })
  it('should navigate to previous route on close click', async () => {
    render(<Provider>
      <SearchBar />
    </Provider>, {
      route: {
        path: '/t/:tenantId/search/:searchVal',
        params: { tenantId: 't1', searchVal: 'abc' }
      }
    })
    const closeIcon = await screen.findByTestId('search-close')
    fireEvent.click(closeIcon)
    expect(mockedUsedNavigate).toHaveBeenCalledWith(-1)
  })
  it('should not navigate to previous route on close click', async () => {
    render(<Provider>
      <SearchBar />
    </Provider>, {
      route: {
        path: '/t/:tenantId/dashboard',
        params: { tenantId: 't1' }
      }
    })
    const searchBtn = await screen.findByTestId('search-button')
    fireEvent.click(searchBtn)
    const closeIcon = screen.getByTestId('search-close')
    fireEvent.click(closeIcon)
    expect(mockedUsedNavigate).not.toHaveBeenCalled()
  })
})
describe('Search Bar (feature disabled)', () => {

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
  })
  it('should trigger search on send click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider>
      <SearchBar />
    </Provider>, {
      route: {
        path: '/t/:tenantId/dashboard',
        params: { tenantId: 't1' }
      }
    })
    const searchBtn = await screen.findByTestId('search-button')
    expect(searchBtn).toBeDisabled()
  })
})

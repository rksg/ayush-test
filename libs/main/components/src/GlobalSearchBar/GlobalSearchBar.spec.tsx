import '@testing-library/jest-dom'
import { useState } from 'react'

import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useLocation }               from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { HeaderContext } from '../HeaderContext'

import { GlobalSearchBar } from './index'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn()
}))

interface SearchProps {
  defaultExpand?: boolean
}
function SearchBarMock (props: SearchProps) {

  const [searchExpanded, setSearchExpanded] = useState<boolean>(!!props.defaultExpand)
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)

  return (
    <HeaderContext.Provider value={{
      searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
      <GlobalSearchBar />
    </HeaderContext.Provider>
  )
}


describe('Search Bar (feature enabled)', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const location = {
    pathname: '/t1/t/dashboard',
    key: '123',
    state: {},
    search: '',
    hash: ''
  }
  beforeEach(() => {
    mockedUsedNavigate.mockClear()
  })
  it('should trigger search on send click', async () => {
    jest.mocked(useLocation).mockReturnValue(location)
    render(<Provider>
      <SearchBarMock />
    </Provider>, {
      route: {
        path: '/:tenantId/t/dashboard',
        params: { tenantId: 't1' }
      }
    })
    const searchBtn = await screen.findByTestId('search-button')
    fireEvent.click(searchBtn)
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: '' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(mockedUsedNavigate).not.toHaveBeenCalled()
    fireEvent.change(searchInput, { target: { value: 'abc!' } })
    fireEvent.click(screen.getByTestId('search-send'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/search/abc%21'
    )
    expect(mockedUsedNavigate.mock.calls[0][1].replace).toBeFalsy()
  })
  it('should trigger search on keyboard enter', async () => {
    jest.mocked(useLocation).mockReturnValue({
      ...location,
      pathname: '/t1/t/search/abc'
    })
    render(<Provider>
      <SearchBarMock defaultExpand={true}/>
    </Provider>, {
      route: {
        path: '/:tenantId/t/search/:searchVal',
        params: { tenantId: 't1', searchVal: 'abc' }
      }
    })
    const searchInput = await screen.findByTestId('search-input')
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/search/abc'
    )
    expect(mockedUsedNavigate.mock.calls[0][1].replace).toBeTruthy()
    fireEvent.keyDown(searchInput, { key: 'Esc' })
    expect(mockedUsedNavigate).toHaveBeenCalledTimes(1)
  })
  it('should navigate to previous route on close click', async () => {
    jest.mocked(useLocation).mockReturnValue({
      ...location,
      pathname: '/t1/t/search/abc'
    })
    render(<Provider>
      <SearchBarMock defaultExpand={true}/>
    </Provider>, {
      route: {
        path: '/:tenantId/t/search/:searchVal',
        params: { tenantId: 't1', searchVal: 'abc' }
      }
    })
    const closeIcon = await screen.findByTestId('search-close')
    fireEvent.click(closeIcon)
    expect(mockedUsedNavigate).toHaveBeenCalledWith(-1)
  })
  it('should not navigate to previous route on close click', async () => {
    jest.mocked(useLocation).mockReturnValue({
      ...location
    })
    render(<Provider>
      <SearchBarMock />
    </Provider>, {
      route: {
        path: '/:tenantId/t/dashboard',
        params: { tenantId: 't1' }
      }
    })
    const searchBtn = await screen.findByTestId('search-button')
    fireEvent.click(searchBtn)
    const closeIcon = screen.getByTestId('search-close')
    fireEvent.click(closeIcon)
    expect(mockedUsedNavigate).not.toHaveBeenCalled()
  })
  it('should navigate to /dashboard route on close click', async () => {
    jest.mocked(useLocation).mockReturnValue({
      ...location,
      pathname: '/t1/t/search/abc',
      key: 'default'
    })
    render(<Provider>
      <SearchBarMock defaultExpand={true}/>
    </Provider>, {
      route: {
        path: '/:tenantId/t/search/:searchVal',
        params: { tenantId: 't1', searchVal: 'abc' }
      }
    })
    const closeIcon = await screen.findByTestId('search-close')
    fireEvent.click(closeIcon)
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/dashboard'
    )
  })
})

import React, { useEffect } from 'react'

import { renderHook, render } from '@testing-library/react'
import { MemoryRouter }       from 'react-router-dom'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { useDashboardFilter, DashboardFilterProvider } from './dashboardFilterContext'

describe('useDashboardFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('should return default value', () => {
    const { result } = renderHook(useDashboardFilter)
    let isCallableFn = false
    if (typeof result.current.setNodeFilter === 'function') {
      result.current.setNodeFilter([{ name: 'test', type: 'zone' }])
      isCallableFn = true
    }
    expect(isCallableFn).toBeTruthy()
    expect(result.current.filters).toEqual({
      path: [{ name: 'Network', type: 'network' }],
      startDate: '2021-12-31T00:00:00+00:00',
      endDate: '2022-01-01T00:00:00+00:00',
      range: 'Last 24 Hours',
      filter: {}
    })
  })
})

describe('DashboardFilterProvider', () => {
  const filter = {
    path: [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'A-T-Venue' },
      { type: 'AP', name: 'D8:38:FC:36:78:D0' }
    ]
  }
  const path = Buffer.from(JSON.stringify(filter)).toString('base64')
  it('should render correctly', () => {
    function Component () {
      const { filters } = useDashboardFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <DashboardFilterProvider>
        <Component />
      </DashboardFilterProvider>
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('changes filter value', () => {
    function Component () {
      const { filters, setNodeFilter } = useDashboardFilter()
      useEffect(() => {
        setNodeFilter(filters.path)
      })
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <DashboardFilterProvider>
        <Component />
      </DashboardFilterProvider>
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('gets initial value from search parameters', () => {
    function Component () {
      const { filters } = useDashboardFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/incidents',
        search: `?dashboardVenueFilter=${path}`
      }]}>
        <DashboardFilterProvider>
          <Component />
        </DashboardFilterProvider>
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot() 
  })
  it('set empty array when path is empty', () => {
    function Component () {
      const { filters, setNodeFilter } = useDashboardFilter()
      useEffect(() => {
        setNodeFilter([])
      })
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <DashboardFilterProvider>
        <Component />
      </DashboardFilterProvider>
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
})

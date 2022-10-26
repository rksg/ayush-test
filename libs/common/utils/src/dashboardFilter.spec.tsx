import React, { useEffect } from 'react'

import { renderHook, render } from '@testing-library/react'
import { MemoryRouter }       from 'react-router-dom'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { useDashboardFilter } from './dashboardFilter'

const original = Date.now
describe('useDashboardFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  afterAll(() => Date.now = original)
  it('should return default value', () => {
    const { result } = renderHook(() => useDashboardFilter(), {
      wrapper: ({ children }) =>
        <BrowserRouter>
          {children}
        </BrowserRouter>
    })

    expect(result.current.filters).toEqual({
      path: [{ name: 'Network', type: 'network' }],
      startDate: '2021-12-31T00:00:00+00:00',
      endDate: '2022-01-01T00:00:00+00:00',
      range: 'Last 24 Hours',
      filter: {}
    })
  })

  it('should render correctly', () => {
    function Component () {
      const { filters } = useDashboardFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <Component />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('changes filter value', () => {
    function Component () {
      const { filters, setNodeFilter } = useDashboardFilter()
      useEffect(() => {
        setNodeFilter([['venue1']])
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <Component />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('gets initial value from search parameters', () => {
    function Component () {
      const { filters } = useDashboardFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const nodes = [['venue1'], ['venue2']]
    const path = Buffer.from(JSON.stringify({ nodes })).toString('base64')
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/incidents',
        search: `?dashboardVenueFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('set empty array when path is empty', () => {
    function Component () {
      const { filters, setNodeFilter } = useDashboardFilter()
      useEffect(() => {
        setNodeFilter([])
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <Component />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
})

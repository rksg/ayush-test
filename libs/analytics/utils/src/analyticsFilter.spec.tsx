import { useEffect } from 'react'

import { renderHook, render } from '@testing-library/react'
import { MemoryRouter }       from 'react-router-dom'

import { resetGlobalDateRange } from '@acx-ui/utils'

import { useAnalyticsFilter } from './analyticsFilter'

const original = Date.now
describe('useAnalyticsFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
    resetGlobalDateRange()
  })

  afterAll(() => {
    Date.now = original
    resetGlobalDateRange()
  })

  it('should return correct value', () => {
    const { result } = renderHook(useAnalyticsFilter, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
    })
    expect(result.current.setNetworkPath).toBeDefined()
    expect(result.current.filters).toEqual({
      path: [{ name: 'Network', type: 'network' }],
      startDate: '2021-12-31T00:00:00+00:00',
      endDate: '2022-01-01T00:00:00+00:00',
      range: 'Last 24 Hours'
    })
  })

  const filter = {
    path: [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'A-T-Venue' },
      { type: 'AP', name: 'D8:38:FC:36:78:D0' }
    ],
    raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
  }
  const path = Buffer.from(JSON.stringify(filter)).toString('base64')
  it('should render correctly', () => {
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<MemoryRouter initialEntries={[{
      pathname: '/analytics/incidents',
      search: ''
    }]}>
      <Component />
    </MemoryRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('changes filter value', () => {
    function Component () {
      const { filters, raw, setNetworkPath } = useAnalyticsFilter()
      useEffect(() => {
        setNetworkPath(filters.path, raw)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<MemoryRouter initialEntries={[{
      pathname: '/analytics/incidents',
      search: ''
    }]}>
      <Component />
    </MemoryRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('gets initial value from search parameters', () => {
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/incidents',
        search: `?analyticsNetworkFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should set filter with switches when search parameters has switches', () => {
    const filter = {
      path: [
        { type: 'network', name: 'Network' },
        { type: 'switchGroup', name: 'switchGroup' },
        { type: 'switch', name: 'D8:38:FC:36:78:D0' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = Buffer.from(JSON.stringify(filter)).toString('base64')
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/incidents',
        search: `?analyticsNetworkFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should set filter with switchGroup & zone', () => {
    const filter = {
      path: [
        { type: 'network', name: 'Network' },
        { type: 'switchGroup', name: 'switchGroup' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = Buffer.from(JSON.stringify(filter)).toString('base64')
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/incidents',
        search: `?analyticsNetworkFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should set filter to default when select path does not have switch or AP', () => {
    const filter = {
      path: [
        { type: 'network', name: 'Network' },
        { type: 'someType', name: 'someValue' },
        { type: 'randomType', name: 'randomValue' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = Buffer.from(JSON.stringify(filter)).toString('base64')
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/incidents',
        search: `?analyticsNetworkFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should set path to default when path is health and selected node is switch', () => {
    const filter = {
      path: [
        { type: 'network', name: 'Network' },
        { type: 'switchGroup', name: 'switchGroup' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = Buffer.from(JSON.stringify(filter)).toString('base64')
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/health',
        search: `?analyticsNetworkFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should set filters correctly path is health and selected node is zone', () => {
    const filter = {
      path: [
        { type: 'network', name: 'Network' },
        { type: 'zone', name: 'Zone' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = Buffer.from(JSON.stringify(filter)).toString('base64')
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/health',
        search: `?analyticsNetworkFilter=${path}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})

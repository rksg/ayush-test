import { useEffect } from 'react'

import { renderHook, render } from '@testing-library/react'
import { MemoryRouter }       from 'react-router-dom'

import { resetRanges, fixedEncodeURIComponent } from '@acx-ui/utils'

import { useAnalyticsFilter, getFilterPayload, getSelectedNodePath, pathToFilter } from './analyticsFilter'

const network = { type: 'network', name: 'Network' }
const original = Date.now
describe('useAnalyticsFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
    resetRanges()
  })

  afterAll(() => Date.now = original)

  it('should return correct value', () => {
    const { result } = renderHook(useAnalyticsFilter, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
    })
    expect(result.current.filters).toEqual({
      filter: {},
      startDate: '2021-12-31T00:00:00+00:00',
      endDate: '2022-01-01T00:00:59+00:00',
      range: 'Last 24 Hours'
    })
    expect(result.current.path).toEqual([])
  })

  const filter = {
    path: [
      { type: 'zone', name: 'A-T-Venue' },
      { type: 'AP', name: 'D8:38:FC:36:78:D0' }
    ],
    raw: ['[{\\"type\\":\\"zone\\",\\"name\\":\\"A-T-Venue\\"},...]']
  }
  const path = fixedEncodeURIComponent(JSON.stringify(filter))

  it('should render correctly', () => {
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
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
      const { filters, path, raw, setNetworkPath } = useAnalyticsFilter()
      useEffect(() => {
        setNetworkPath([], raw)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
    }
    const { asFragment } = render(<MemoryRouter initialEntries={[{
      pathname: '/analytics/incidents',
      search: `?analyticsNetworkFilter=${path}`
    }]}>
      <Component />
    </MemoryRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('gets initial value from search parameters', () => {
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
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
        { type: 'switchGroup', name: 'switchGroup' },
        { type: 'switch', name: 'D8:38:FC:36:78:D0' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = fixedEncodeURIComponent(JSON.stringify(filter))
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
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
        { type: 'switchGroup', name: 'switchGroup' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = fixedEncodeURIComponent(JSON.stringify(filter))
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
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
        { type: 'switchGroup', name: 'switchGroup' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = fixedEncodeURIComponent(JSON.stringify(filter))
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
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
        { type: 'zone', name: 'Zone' }
      ],
      raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
    }
    const path = fixedEncodeURIComponent(JSON.stringify(filter))
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
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
  it('imports dashboard filter with single venue', () => {
    const venues = fixedEncodeURIComponent(JSON.stringify({
      nodes: [['venueId1']]
    }))
    function Component () {
      const { filters, path } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)} | {JSON.stringify(path)}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/analytics/incidents',
        search: `?dashboardVenueFilter=${venues}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
describe('getFilterPayload', () => {
  it('returns default path', () => {
    const filter = {
      networkNodes: [[{ type: 'zone' as 'zone', name: 'Zone' }]],
      switchNodes: [[{ type: 'switchGroup' as 'switchGroup', name: 'Switches' }]]
    }
    expect(getFilterPayload({ filter })).toEqual({
      filter,
      path: [network]
    })
  })
})
describe('getSelectedNodePath', () => {
  it('returns ap, switch or default path', () => {
    expect(getSelectedNodePath({
      networkNodes: [[{ type: 'zone', name: 'Zone' }]],
      switchNodes: [[{ type: 'switchGroup', name: 'Switches' }]]
    })).toEqual([network, { type: 'zone', name: 'Zone' }])
    expect(getSelectedNodePath({
      switchNodes: [[{ type: 'switchGroup', name: 'Switches' }]]
    })).toEqual([network, { type: 'switchGroup', name: 'Switches' }])
    expect(getSelectedNodePath({
      networkNodes: [[{ type: 'zone', name: 'Zone' }, { type: 'apGroup', name: 'a1' }]]
    })).toEqual([network, { type: 'zone', name: 'Zone' }]) // TODO , { type: 'apGroup', name: 'a1' }
    expect(getSelectedNodePath({
      networkNodes: [[{ type: 'zone', name: 'Zone' }, { type: 'apMac', list: ['m1'] }]]
    })).toEqual([network, { type: 'zone', name: 'Zone' }, { type: 'AP', name: 'm1' }])
    expect(getSelectedNodePath({
      switchNodes: [[{ type: 'switchGroup', name: 'sg1' }, { type: 'switch', list: ['s1'] }]]
    })).toEqual([network, { type: 'switchGroup', name: 'sg1' }, { type: 'switch', name: 's1' }])
    expect(getSelectedNodePath({
      // default
    })).toEqual([network])
  })
})
describe('pathToFilter', () => {
  it('does not override non venue paths', () => {
    expect(pathToFilter(
      [{ type: 'switch', name: 'mac1' }]
    )).toEqual({
      networkNodes: [[{ list: ['mac1'], type: 'switch' }]],
      switchNodes: [[{ list: ['mac1'], type: 'switch' }]]
    })
  })
  it('returns ap group', () => {
    expect(pathToFilter(
      [{ type: 'zone', name: 'z1' }, { type: 'apGroup', name: 'a1' }]
    )).toEqual({
      networkNodes: [[{ type: 'zone', name: 'z1' }]], // TODO , { type: 'apGroup', name: 'a1' }
      switchNodes: [[{ type: 'zone', name: 'z1' }]] // TODO , { type: 'apGroup', name: 'a1' }
    })
  })
})

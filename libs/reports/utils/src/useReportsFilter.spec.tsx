import { useEffect } from 'react'

import { renderHook, render } from '@testing-library/react'
import { MemoryRouter }       from 'react-router-dom'

import { resetRanges, fixedEncodeURIComponent } from '@acx-ui/utils'

import { useReportsFilter } from './useReportsFilter'

const original = Date.now
describe('useReportsFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
    resetRanges()
  })

  afterAll(() => Date.now = original)
  const filter = {
    paths: [[
      { type: 'network', name: 'Network' },
      { type: 'zone', name: '555548721e264115bda45a75043f65d7' }
    ]],
    bands: ['5','2.4'],
    raw: ['[{\\"type\\":\\"network\\",\\"name\\":\\"Network\\"},...]']
  }
  const encodedFilter = fixedEncodeURIComponent(JSON.stringify(filter))
  it('should return correct value', () => {
    const { result } = renderHook(useReportsFilter, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
    })
    expect(result.current.setNetworkPath).toBeDefined()
    expect(result.current.filters).toEqual({
      paths: [[{ name: 'Network', type: 'network' }]],
      bands: []
    })
  })
  it('gets initial value from search parameters', () => {
    function Component () {
      const { filters, raw } = useReportsFilter()
      return <div>{JSON.stringify({ filters, raw })}</div>
    }
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/reports/wireless',
        search: `?reportsNetworkFilter=${encodedFilter}`
      }]}>
        <Component />
      </MemoryRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('changes filter value', () => {
    function Component () {
      const { filters, raw, setNetworkPath } = useReportsFilter()
      useEffect(() => {
        setNetworkPath(filters.paths,['2.4'], raw)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<MemoryRouter initialEntries={[{
      pathname: '/reports/wireless',
      search: ''
    }]}>
      <Component />
    </MemoryRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
})
import { renderHook, render, act } from '@testing-library/react'

import { BrowserRouter } from '@acx-ui/react-router-dom'


import { useDateFilter }                                             from './dateFilter'
import { defaultRanges, DateRange, getDateRangeFilter, resetRanges } from './dateUtil'
import { fixedEncodeURIComponent, useEncodedParameter }              from './encodedParameter'
jest.mock('./encodedParameter', () => ({
  ...jest.requireActual('./encodedParameter'),
  useEncodedParameter: jest.fn()
}))

const original = Date.now
describe('useDateFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
    resetRanges()
  })

  afterAll(() => Date.now = original)

  it('should return correctly value', () => {
    const { result } = renderHook(() => useDateFilter(), {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
    })
    expect(result.current).toMatchObject({
      startDate: '2021-12-31T00:01:00+00:00',
      endDate: '2022-01-01T00:01:00+00:00',
      range: 'Last 24 Hours'
    })
  })

  it('should render correctly', () => {
    function Component () {
      const filters = useDateFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <BrowserRouter>
        <Component />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('sets period params when calling setDateFilter', async () => {
    function Component (props: { update: boolean }) {
      const filters = useDateFilter()
      props.update && filters?.setDateFilter?.(getDateRangeFilter(DateRange.last30Days))
      return <div>{JSON.stringify(filters)}</div>
    }
    const component = (update: boolean) => <BrowserRouter>
      <Component update={update} />
    </BrowserRouter>
    const { asFragment, rerender } = render(component(true))
    expect(asFragment()).toMatchSnapshot()
    rerender(component(false))
    expect(asFragment()).toMatchSnapshot()
  })
})


describe('defaultRanges', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:30.123Z').getTime())
  })

  afterAll(() => Date.now = original)

  it('should return defaultRange when no subRange', () => {
    const result = defaultRanges()
    expect(
      Object.entries(result).reduce((agg, [key, values]) => {
        agg[key as keyof typeof result] = values.map((t) => t.toISOString())
        return agg
      }, {} as Record<string, string[]>)
    ).toStrictEqual({
      'All Time': ['2022-01-01T00:00:30.123Z', '2022-01-01T00:00:30.123Z'],
      'Last 24 Hours': ['2021-12-31T00:01:00.000Z', '2022-01-01T00:01:00.000Z'],
      'Last 7 Days': ['2021-12-25T00:01:00.000Z', '2022-01-01T00:01:00.000Z'],
      'Last 30 Days': ['2021-12-02T00:01:00.000Z', '2022-01-01T00:01:00.000Z'],
      'Last 8 Hours': [ '2021-12-31T16:01:00.000Z','2022-01-01T00:01:00.000Z']
    })
  })

  it('should return defaultRange when having subRange', () => {
    const result = defaultRanges([DateRange.last24Hours])
    expect(
      Object.entries(result).reduce((agg, [key, values]) => {
        agg[key as keyof typeof result] = values.map((t) => t.toISOString())
        return agg
      }, {} as Record<string, string[]>)
    ).toStrictEqual({
      'Last 24 Hours': ['2021-12-31T00:01:00.000Z', '2022-01-01T00:01:00.000Z']
    })
  })
})

describe('getDateRangeFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  afterAll(() => Date.now = original)

  it('should return correct dateFilter for the custom range', () => {
    expect(
      getDateRangeFilter(
        DateRange.custom,
        '2021-12-31T23:00:00Z',
        '2022-01-01T00:00:00Z'
      )
    ).toStrictEqual({
      startDate: '2021-12-31T23:00:00Z',
      endDate: '2022-01-01T00:00:00Z',
      range: 'Custom'
    })
  })
})


describe('Range selection', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
    resetRanges()
  })
  it('should handle last8Hours and other options selection correctly on dashboard', () => {
    const mockWrite = jest.fn()
    jest.mocked(useEncodedParameter).mockReturnValue({
      read: jest.fn().mockReturnValue(null),
      write: mockWrite
    })
    const { result } = renderHook(() => useDateFilter(true), {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
    })
    act(() => {
      result.current.setDateFilter({
        range: DateRange.last8Hours,
        startDate: 'startDate',
        endDate: 'endDate'
      })
    })
    expect(result.current.range).toEqual(DateRange.last8Hours)
    act(() => {
      result.current.setDateFilter({
        range: DateRange.last24Hours,
        startDate: 'startDate',
        endDate: 'endDate'
      })
    })
    expect(result.current.range).toEqual(DateRange.last24Hours)
  })
  it('should handle last8Hours and other options selection correctly on other pages', () => {
    const mockWrite = jest.fn()
    jest.mocked(useEncodedParameter).mockReturnValue({
      read: jest.fn().mockReturnValue(null),
      write: mockWrite
    })
    const { result } = renderHook(() => useDateFilter(), {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
    })
    act(() => {
      result.current.setDateFilter({
        range: DateRange.last8Hours,
        startDate: 'startDate',
        endDate: 'endDate'
      })
    })
    expect(result.current.range).toEqual(DateRange.last24Hours)
    act(() => {
      result.current.setDateFilter({
        range: DateRange.last30Days,
        startDate: 'startDate',
        endDate: 'endDate'
      })
    })
    expect(result.current.range).toEqual(DateRange.last30Days)
  })

})
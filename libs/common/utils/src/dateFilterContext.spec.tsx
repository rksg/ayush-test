import React, { useEffect } from 'react'

import { renderHook, render } from '@testing-library/react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { useDateFilter, DateFilterProvider }            from './dateFilterContext'
import { defaultRanges, DateRange, getDateRangeFilter } from './dateUtil'

describe('useDateFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('should return correctly value', () => {
    const { result } = renderHook(useDateFilter)
    expect(result.current).toMatchObject({
      startDate: '2021-12-31T00:00:00+00:00',
      endDate: '2022-01-01T00:00:00+00:00',
      range: 'Last 24 Hours'
    })
  })
})

describe('DateFilterProvider', () => {
  it('should render correctly', () => {
    function Component () {
      const filters = useDateFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <BrowserRouter>
        <DateFilterProvider>
          <Component />
        </DateFilterProvider>
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should set url on rerender', () => {
    function Component () {
      const filters = useDateFilter()
      useEffect(() => {
        filters?.setDateFilter?.({
          ...getDateRangeFilter(DateRange.lastMonth)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div>{JSON.stringify(filters)}</div>
    }

    const { asFragment } = render(
      <BrowserRouter>
        <DateFilterProvider>
          <Component />
        </DateFilterProvider>
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with default date from url', () => {
    function Component () {
      const filters = useDateFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const location = {
      ...window.location,
      search:
        // eslint-disable-next-line max-len
        '?period=eyJzdGFydERhdGUiOiIyMDIyLTA3LTIzVDE4OjMxOjAwKzA4OjAwIiwiZW5kRGF0ZSI6IjIwMjItMDctMjRUMTg6MzE6MDArMDg6MDAiLCJyYW5nZSI6Ikxhc3QgMjQgSG91cnMifQ=='
    }
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    })
    const { asFragment } = render(
      <BrowserRouter window={window}>
        <DateFilterProvider>
          <Component />
        </DateFilterProvider>
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('defaultRanges', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('should return defaultRange when no subRange', () => {
    const result = defaultRanges()
    expect(
      Object.entries(result).reduce((agg, [key, values]) => {
        agg[key as keyof typeof result] = values.map((t) => t.toISOString())
        return agg
      }, {} as Record<string, string[]>)
    ).toStrictEqual({
      'Last 1 Hour': ['2021-12-31T23:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last 24 Hours': ['2021-12-31T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last 7 Days': ['2021-12-25T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last Month': ['2021-12-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Today': ['2022-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z']
    })
  })

  it('should return defaultRange when having subRange', () => {
    const result = defaultRanges([DateRange.today])
    expect(
      Object.entries(result).reduce((agg, [key, values]) => {
        agg[key as keyof typeof result] = values.map((t) => t.toISOString())
        return agg
      }, {} as Record<string, string[]>)
    ).toStrictEqual({
      Today: ['2022-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z']
    })
  })
})

describe('getDateRangeFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('should return correct dateFilter for the given range', () => {
    expect(getDateRangeFilter(DateRange.last1Hour)).toStrictEqual({
      startDate: '2021-12-31T23:00:00+00:00',
      endDate: '2022-01-01T00:00:00+00:00',
      range: 'Last 1 Hour'
    })
  })
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

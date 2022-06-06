import React from 'react'

import { renderHook, render } from '@testing-library/react'
import moment                 from 'moment-timezone'

import {
  defaultRanges,
  DateRange,
  getDateRangeFilter,
  useGlobalFilter,
  GlobalFilterProvider
} from './globalFilter'

describe('useGlobalFilter', ()=>{
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('should return correctly value',()=>{
    const { result } = renderHook(useGlobalFilter)
    expect(result.current).toEqual({
      path: [{ name: 'Network', type: 'network' }],
      startDate: '2021-12-31T08:00:00+08:00',
      endDate: '2022-01-01T08:00:00+08:00'
    })
  })
})

describe('GlobalFilterProvider', ()=>{
  it('should render correctly',()=>{
    function Component () {
      const filters = useGlobalFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<GlobalFilterProvider><Component/></GlobalFilterProvider>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('defaultRanges', () => {
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('should return defaultRange when no subRange', () => {
    const result = defaultRanges()
    expect(Object.entries(result).reduce((agg, [key, values]) => {
      agg[key as keyof typeof result] = values.map((t) => t.toISOString())
      return agg
    }, {} as unknown as Record<string, string[]>)).toStrictEqual({
      'Last 1 Hour': ['2021-12-31T23:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last 24 Hours': ['2021-12-31T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last 7 Days': ['2021-12-25T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last Month': ['2021-12-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Today': ['2021-12-31T16:00:00.000Z', '2022-01-01T00:00:00.000Z']
    })
  })

  it('should return defaultRange when having subRange', () => {
    const result = defaultRanges([DateRange.today])
    expect(Object.entries(result).reduce((agg, [key, values]) => {
      agg[key as keyof typeof result] = values.map((t) => t.toISOString())
      return agg
    }, {} as unknown as Record<string, string[]>)).toStrictEqual({
      Today: ['2021-12-31T16:00:00.000Z', '2022-01-01T00:00:00.000Z']
    })
  })
})

describe('getDateRangeFilter', () => {
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('should return correct dateFilter', () => {
    expect(getDateRangeFilter({ range: DateRange.last1Hour })).toStrictEqual({
      startDate: '2022-01-01T07:00:00+08:00',
      endDate: '2022-01-01T08:00:00+08:00'
    })
  })
})

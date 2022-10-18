import { useContext, useState } from 'react'

import { useSearchParams } from 'react-router-dom'

import { BrowserRouter as Router }      from '@acx-ui/react-router-dom'
import { act, renderHook }              from '@acx-ui/test-utils'
import { TimeStampRange }               from '@acx-ui/types'
import { DateFilterContext, DateRange } from '@acx-ui/utils'

import {
  HealthPageContext,
  HealthPageContextProvider,
  formatTimeWindow
} from './HealthPageContext'

describe('HealthPageContextProvider', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  const expectedTimeWindow: TimeStampRange = [
    '2021-12-31T00:00:00.000Z',
    '2022-01-01T00:00:00.000Z'
  ]
  it('load analytics filter context with timeWindow set to start/end of filter', async () => {
    const { result } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <Router><HealthPageContextProvider children={children} /></Router>
    })

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)
  })

  it('update timeWindow when setTimeWindow called', async () => {
    const { result, rerender } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <Router><HealthPageContextProvider children={children} /></Router>
    })

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)

    const nextTimeWindow: TimeStampRange = [
      '2022-01-01T01:00:00.000Z',
      '2022-01-01T02:00:00.000Z'
    ]

    act(() => result.current.setTimeWindow(nextTimeWindow))

    rerender()

    expect(result.current.timeWindow).toEqual(nextTimeWindow)
  })

  it('resets timeWindow', async () => {
    const { result, rerender } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <Router><HealthPageContextProvider children={children} /></Router>
    })

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)

    const nextTimeWindow: TimeStampRange = [
      '2022-01-01T01:00:00.000Z',
      '2022-01-01T02:00:00.000Z'
    ]

    act(() => result.current.setTimeWindow(nextTimeWindow, true))

    rerender()

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)
  })

  it('update timeWindow when analytic filter start/end changed', () => {
    const Wrapper = ({ children }: { children: JSX.Element }) => {
      const [search, setSearch] = useSearchParams()
      const [dateFilter, setDate] = useState({
        range: DateRange.custom,
        startDate: '2022-01-01T00:00:00.000Z',
        endDate: '2022-01-02T00:00:00.000Z'
      })
      const setDateFilter = (date: { range: DateRange, startDate: string, endDate: string }) => {
        search.set('some', 'param')
        setSearch(search)
        setDate(date)
      }
      return <DateFilterContext.Provider value={{ dateFilter, setDateFilter }}>
        <HealthPageContextProvider children={children} />
      </DateFilterContext.Provider>
    }

    const { result, rerender } = renderHook(() => {
      const { setDateFilter } = useContext(DateFilterContext)
      return { ...useContext(HealthPageContext), setDateFilter }
    }, {
      wrapper: ({ children }) => <Router><Wrapper children={children} /></Router>
    })

    expect(result.current.timeWindow).toEqual([
      result.current.startDate,
      result.current.endDate
    ])

    const nextTimeWindow = [
      '2022-01-01T01:00:00.000Z',
      '2022-01-01T02:00:00.000Z'
    ]

    act(() => result.current.setDateFilter!({
      range: DateRange.custom,
      startDate: nextTimeWindow[0],
      endDate: nextTimeWindow[1]
    }))

    rerender()

    expect(result.current.timeWindow).toEqual(nextTimeWindow)
  })
})

describe('formatTimeWindow', () => {
  it('should convert numeric window to valid date', () => {
    const stringTimeWindow: TimeStampRange = [
      '2022-09-25T12:15:57.462Z',
      '2022-09-26T09:00:00.000Z'
    ]

    const numericTimeWindow: TimeStampRange = [
      1664108157462,
      1664182800000
    ]

    const formattedWindow = formatTimeWindow(numericTimeWindow)
    expect(formattedWindow).toMatchObject(stringTimeWindow)
  })
})

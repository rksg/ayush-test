import { useContext, useState } from 'react'

import { act, renderHook }              from '@acx-ui/test-utils'
import { DateFilterContext, DateRange } from '@acx-ui/utils'

import {
  TimeWindow,
  HealthPageContext,
  HealthPageContextProvider,
  formatTimeWindow
} from './HealthPageContext'

describe('HealthPageContextProvider', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('load analytics filter context with timeWindow set to start/end of filter', async () => {
    const { result } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <HealthPageContextProvider children={children} />
    })

    expect(result.current.timeWindow).toEqual([
      result.current.startDate,
      result.current.endDate
    ])
  })

  it('update timeWindow when setTimeWindow called', async () => {
    const { result, rerender } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <HealthPageContextProvider children={children} />
    })

    expect(result.current.timeWindow).toEqual([
      result.current.startDate,
      result.current.endDate
    ])

    const nextTimeWindow: TimeWindow = [
      '2022-01-01T01:00:00.000Z',
      '2022-01-01T02:00:00.000Z'
    ]

    act(() => result.current.setTimeWindow(nextTimeWindow))

    rerender()

    expect(result.current.timeWindow).toEqual(nextTimeWindow)
  })

  it('update timeWindow when analytic filter start/end changed', () => {
    const Wrapper = ({ children }: { children: JSX.Element }) => {
      const [dateFilter, setDateFilter] = useState({
        range: DateRange.custom,
        startDate: '2022-01-01T00:00:00.000Z',
        endDate: '2022-01-02T00:00:00.000Z'
      })
      return <DateFilterContext.Provider value={{ dateFilter, setDateFilter }}>
        <HealthPageContextProvider children={children} />
      </DateFilterContext.Provider>
    }

    const { result, rerender } = renderHook(() => {
      const { setDateFilter } = useContext(DateFilterContext)
      return { ...useContext(HealthPageContext), setDateFilter }
    }, {
      wrapper: ({ children }) => <Wrapper children={children} />
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
    const stringTimeWindow: TimeWindow = [
      '2022-09-25T12:15:57+00:00',
      '2022-09-26T09:00:00+00:00'
    ]

    const numericTimeWindow: TimeWindow = [
      1664108157462,
      1664182800000
    ]

    const formattedWindow = formatTimeWindow(numericTimeWindow, stringTimeWindow)
    expect(formattedWindow).toMatchObject(stringTimeWindow)
  })

  it('should restrict time window to start date', () => {
    const startDateOverWindow: TimeWindow = [
      '2022-09-22T12:15:57+00:00',
      '2022-09-26T09:00:00+00:00'
    ]

    const restrictedStartDate: TimeWindow = [
      '2022-09-23T12:15:57+00:00',
      '2022-09-27T09:00:00+00:00'
    ]

    const expectedWindow: TimeWindow = [
      '2022-09-23T12:15:57+00:00',
      '2022-09-26T09:00:00+00:00'
    ]

    const formattedWindow = formatTimeWindow(startDateOverWindow, restrictedStartDate)
    expect(formattedWindow).toMatchObject(expectedWindow)
  })

  it('should restrict time window to end date', () => {
    const endDateOverWindow: TimeWindow = [
      '2022-09-24T12:15:57+00:00',
      '2022-09-26T09:00:00+00:00'
    ]

    const restrictedEndDate: TimeWindow = [
      '2022-09-23T12:15:57+00:00',
      '2022-09-25T09:00:00+00:00'
    ]

    const expectedWindow: TimeWindow = [
      '2022-09-24T12:15:57+00:00',
      '2022-09-25T09:00:00+00:00'
    ]

    const formattedWindow = formatTimeWindow(endDateOverWindow, restrictedEndDate)
    expect(formattedWindow).toMatchObject(expectedWindow)
  })
})

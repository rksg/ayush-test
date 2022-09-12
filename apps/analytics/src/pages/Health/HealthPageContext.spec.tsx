import { useContext, useState } from 'react'

import { act, renderHook }              from '@acx-ui/test-utils'
import { DateFilterContext, DateRange } from '@acx-ui/utils'

import {
  TimeWindow,
  HealthPageContext,
  HealthPageContextProvider
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

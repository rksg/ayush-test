import { useContext } from 'react'

import moment from 'moment-timezone'

import { useApCountForNodeQuery }  from '@acx-ui/analytics/services'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { act, renderHook }         from '@acx-ui/test-utils'
import { TimeStampRange }          from '@acx-ui/types'
import { resetRanges }             from '@acx-ui/utils'

import {
  HealthPageContext,
  HealthPageContextProvider,
  formatTimeWindow
} from './HealthPageContext'

const mockUseApCountForNodeQuery = useApCountForNodeQuery as jest.Mock
jest.mock('@acx-ui/analytics/services', () => ({
  useApCountForNodeQuery: jest.fn()
}))
const original = Date.now
describe('HealthPageContextProvider', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00+00:00').getTime())
    resetRanges()
    mockUseApCountForNodeQuery.mockImplementation(() => ({
      data: { network: { node: { apCount: 10 } } },
      isLoading: false
    }))
  })
  afterEach(() => {
    mockUseApCountForNodeQuery.mockClear()
  })
  afterAll(() => Date.now = original)
  const expectedTimeWindow: TimeStampRange = [
    '2021-12-31T00:00:00+00:00',
    '2022-01-01T00:00:59+00:00'
  ]
  it('should return null if ap count query is still loading', async () => {
    mockUseApCountForNodeQuery.mockImplementation(() => ({
      data: undefined,
      isLoading: true
    }))
    const { result } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <Router><HealthPageContextProvider children={children} /></Router>
    })
    expect(result.current).toBe(null)
  })
  it('load analytics filter context with timeWindow set to start/end of filter', async () => {
    const { result } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <Router><HealthPageContextProvider children={children} /></Router>
    })

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)
  })

  it('update timeWindow when setTimeWindow called', async () => {
    const { result, rerender } = renderHook(() => useContext(HealthPageContext), {
      wrapper: ({ children }) => <Router>
        <HealthPageContextProvider>
          {children}
        </HealthPageContextProvider>
      </Router>
    })

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)

    const nextTimeWindow: TimeStampRange = [
      '2022-01-01T01:00:00+00:00',
      '2022-01-01T02:00:00+00:00'
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
      '2022-01-01T01:00:00+00:00',
      '2022-01-01T02:00:00+00:00'
    ]

    act(() => result.current.setTimeWindow(nextTimeWindow, true))

    rerender()

    expect(result.current.timeWindow).toEqual(expectedTimeWindow)
  })

  it('update timeWindow when analytic filter start/end changed', () => {
    const Wrapper = ({ children }: { children: JSX.Element }) => {
      return <HealthPageContextProvider children={children} />
    }

    const { result, rerender } = renderHook(() => {
      const context = useContext(HealthPageContext)
      const startDate = moment(context.startDate).format()
      const endDate = moment(context.endDate).format()
      return { ...context, startDate, endDate }
    }, {
      wrapper: ({ children }) => <Router><Wrapper children={children} /></Router>
    })

    expect(result.current.timeWindow).toEqual([
      result.current.startDate,
      result.current.endDate
    ])

    const nextTimeWindow = [
      moment('2021-01-01T00:00:00+00:00').format(),
      moment('2021-12-31T00:00:00+00:00').format()
    ]

    act(() => result.current.setTimeWindow!(nextTimeWindow as TimeStampRange))

    rerender()

    expect(result.current.timeWindow).toEqual(nextTimeWindow)
  })
})

describe('formatTimeWindow', () => {
  it('should convert numeric window to valid date', () => {
    const stringTimeWindow: TimeStampRange = [
      '2022-09-25T12:15:57+00:00',
      '2022-09-26T09:00:00+00:00'
    ]

    const numericTimeWindow: TimeStampRange = [
      1664108157462,
      1664182800000
    ]

    const formattedWindow = formatTimeWindow(numericTimeWindow)
    expect(formattedWindow).toMatchObject(stringTimeWindow)
  })
  it('sorts start and end', () => {
    const stringTimeWindow: TimeStampRange = [
      '2022-09-25T12:15:57+00:00',
      '2022-09-26T09:00:00+00:00'
    ]

    const numericTimeWindow: TimeStampRange = [
      1664182800000,
      1664108157462
    ]

    const formattedWindow = formatTimeWindow(numericTimeWindow)
    expect(formattedWindow).toMatchObject(stringTimeWindow)
  })
})

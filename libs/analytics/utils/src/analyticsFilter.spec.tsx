import React from 'react'

import { renderHook, render } from '@testing-library/react'
import moment                 from 'moment-timezone'

import { useAnalyticsFilter, AnalyticsFilterProvider } from './analyticsFilter'

describe('useAnalyticsFilter', () => {
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('should return correctly value', () => {
    const { result } = renderHook(useAnalyticsFilter)
    expect(result.current).toEqual({
      path: [{ name: 'Network', type: 'network' }],
      startDate: '2021-12-31T08:00:00+08:00',
      endDate: '2022-01-01T08:00:00+08:00',
      range: 'Last 24 Hours'
    })
  })
})

describe('AnalyticsFilterProvider', () => {
  it('should render correctly', () => {
    function Component () {
      const filters = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(
      <AnalyticsFilterProvider>
        <Component />
      </AnalyticsFilterProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})

import React from 'react'

import { renderHook, render } from '@testing-library/react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { useAnalyticsFilter, AnalyticsFilterProvider } from './analyticsFilter'

describe('useAnalyticsFilter', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('should return correct value', () => {
    const { result } = renderHook(useAnalyticsFilter)
    let isCallableFn = false
    if (typeof result.current.setNetworkPath === 'function') {
      result.current.setNetworkPath()
      isCallableFn = true
    }
    expect(isCallableFn).toBeTruthy()
    result.current.setNetworkPath()
    expect(result.current.filters).toEqual({
      path: [{ name: 'Network', type: 'network' }],
      startDate: '2021-12-31T00:00:00+00:00',
      endDate: '2022-01-01T00:00:00+00:00',
      range: 'Last 24 Hours'
    })
  })
})

describe('AnalyticsFilterProvider', () => {
  it('should render correctly', () => {
    function Component () {
      const { filters } = useAnalyticsFilter()
      return <div>{JSON.stringify(filters)}</div>
    }
    const { asFragment } = render(<BrowserRouter>
      <AnalyticsFilterProvider>
        <Component />
      </AnalyticsFilterProvider>
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
  })
})

import '@testing-library/jest-dom'

import React from 'react'

import { dataApiURL, Provider, store }                 from '@acx-ui/store'
import { fireEvent, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                        from '@acx-ui/utils'
import { DateRange }                                   from '@acx-ui/utils'

import { mockConnectionDrillDown } from './__tests__/fixtures'
import { api }                     from './services'
import { Point }                   from './styledComponents'

import { HealthDrillDown } from '.'

jest.mock('./healthPieChart', () => ({
  HealthPieChart: (props: {
    setChartKey: (key: string) => void,
    onPieClick: (key: { data: { rawKey?: string, name?: string } }) => void,
    onLegendClick: (key: { rawKey?: string, name?: string }) => void
  }) => <div>
    PIE chart
    <button onClick={() => props.setChartKey('wlans')}>WLANS</button>
    <button onClick={() => props.setChartKey('nodes')}>Venues</button>
    <button onClick={() =>
      props.onPieClick({ data: { rawKey: 'wlan1', name: 'wlan1' } })}>WLAN 1</button>
    <button onClick={() =>
      props.onPieClick({ data: { rawKey: 'wlan2', name: 'wlan2' } })}>WLAN 2</button>
    <button onClick={() => props.onPieClick({ data: { name: 'Others' } })}>Others</button>
    <button onClick={() =>
      props.onLegendClick({ rawKey: 'wlan1 legend', name: 'wlan1 legend' })}>WLAN 1 Legend</button>
  </div>
}))

jest.mock('./impactedClientTable', () => ({
  ...jest.requireActual('./impactedClientTable'),
  ImpactedClientsTable: () => <div data-testid='impactedClientsTable' />
}))

describe('HealthDrillDown', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  } as AnalyticsFilter
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', {
      error: new Error('something went wrong!')
    })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )
    await screen.findByText('Something went wrong.')
  })
  it('should render pie chart and table', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )
    await fireEvent.click(await screen.findByRole('Association'))
    expect(await screen.findByText('PIE chart')).toBeVisible()
  })

  it('should update pieFilter when chart is clicked', async () => {
    const mockSetChartKey = jest.fn()
    jest.spyOn(React, 'useState').mockImplementation(() => {
      return ['wlans', mockSetChartKey]
    })
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )

    await fireEvent.click(await screen.findByRole('Association'))
    await fireEvent.click(screen.getByRole('button', { name: 'WLANS' }))
    expect(mockSetChartKey).toHaveBeenCalledWith('wlans')
    await fireEvent.click(screen.getByRole('button', { name: 'Venues' }))
    expect(mockSetChartKey).toHaveBeenCalledWith('nodes')
    expect(screen.getByTestId('impactedClientsTable')).toBeInTheDocument()
  })

  it('should update pieFilter when pie is clicked', async () => {
    const mockSetPieFilter = jest.fn()
    jest.spyOn(React, 'useState').mockImplementation(() => {
      return [{}, mockSetPieFilter]
    })
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )

    await fireEvent.click(await screen.findByRole('Association'))
    await fireEvent.click(screen.getByRole('button', { name: 'WLAN 1' }))
    expect(mockSetPieFilter).toHaveBeenCalledWith({ rawKey: 'wlan1', name: 'wlan1' })
    expect(screen.getByTestId('impactedClientsTable')).toBeInTheDocument()
  })

  it('should update pieFilter when similar pie is clicked', async () => {
    const mockSetPieFilter = jest.fn()
    jest.spyOn(React, 'useState').mockImplementation(() => {
      return [{ name: 'wlan1', rawKey: 'wlan1' }, mockSetPieFilter]
    })
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )

    await fireEvent.click(await screen.findByRole('Association'))
    await fireEvent.click(screen.getByRole('button', { name: 'WLAN 1' }))
    expect(mockSetPieFilter).toHaveBeenCalledWith(null)
    expect(screen.getByTestId('impactedClientsTable')).toBeInTheDocument()
  })

  it('should update pieFilter when legend is clicked', async () => {
    const mockSetPieFilter = jest.fn()
    jest.spyOn(React, 'useState').mockImplementation(() => {
      return [{}, mockSetPieFilter]
    })
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )

    await fireEvent.click(await screen.findByRole('Association'))
    await fireEvent.click(screen.getByRole('button', { name: 'WLAN 1 Legend' }))
    expect(mockSetPieFilter).toHaveBeenCalledWith({ rawKey: 'wlan1 legend', name: 'wlan1 legend' })
    expect(screen.getByTestId('impactedClientsTable')).toBeInTheDocument()
  })

  it('should update pieFilter when similar legend is clicked', async () => {
    const mockSetPieFilter = jest.fn()
    jest.spyOn(React, 'useState').mockImplementation(() => {
      return [{ rawKey: 'wlan1 legend', name: 'wlan1 legend' }, mockSetPieFilter]
    })
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
    render(
      <Provider>
        <HealthDrillDown
          filters={filters}
          drilldownSelection='connectionFailure'
        />
      </Provider>
    )

    await fireEvent.click(await screen.findByRole('Association'))
    await fireEvent.click(screen.getByRole('button', { name: 'WLAN 1 Legend' }))
    expect(mockSetPieFilter).toHaveBeenCalledWith(null)
    expect(screen.getByTestId('impactedClientsTable')).toBeInTheDocument()
  })

  describe('Point', () => {
    it('should render on null xPos', () => {
      render(<Point $xPos={null} data-testId='point'/>)
      const point = screen.getByTestId('point')
      expect(point).toHaveStyle('left: 50%')
    })
  })
})

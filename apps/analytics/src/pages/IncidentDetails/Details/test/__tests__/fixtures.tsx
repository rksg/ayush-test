/* eslint-env jest */

import { jest } from '@jest/globals'

import { NetworkImpact }        from '../../../NetworkImpact'
import { TimeSeries }           from '../../../TimeSeries'
import { TimeSeriesChartTypes } from '../../../TimeSeries/config'

export function mockNetworkImpact () {
  jest.mocked(NetworkImpact).mockImplementation((props) => <div data-testid='networkImpact'>
    {props.charts.map(item => <div
      key={item.chart}
      data-testid={`network-impact-${item.chart}`}
      data-type={item.type}
      data-dimension={item.dimension}
    />)}
  </div>)
}

export function mockTimeSeries () {
  jest.mocked(TimeSeries).mockImplementation((props) => <div data-testid='timeseries'>
    {props.charts.map(item => <div
      key={TimeSeriesChartTypes[item]}
      data-testid={`timeseries-${TimeSeriesChartTypes[item]}`}
    />)}
  </div>)
}

/* eslint-env jest */
import { jest } from '@jest/globals'

import { TimeSeries }           from '../../../TimeSeries'
import { TimeSeriesChartTypes } from '../../../TimeSeries/config'

export function mockTimeSeries () {
  jest.mocked(TimeSeries).mockImplementation((props) => <div data-testid='timeseries'>
    {props.charts.map(item => <div
      key={TimeSeriesChartTypes[item]}
      data-testid={`timeseries-${TimeSeriesChartTypes[item]}`}
    />)}
  </div>)
}

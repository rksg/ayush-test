import { BrowserRouter } from 'react-router-dom'

import { render } from '@acx-ui/test-utils'

import { getSeriesData } from './stories'

import { MultiLineTimeSeriesChart } from '.'

describe('MultiLineTimeSeriesChart', () => {
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
  })

  it('should render with additional props', () => {
    const formatter = jest.fn()
    render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
        disableLegend={true}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
  })
})

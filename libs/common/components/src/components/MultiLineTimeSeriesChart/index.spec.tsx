import { render } from '@testing-library/react'

import { getSeriesData } from './stories'

import { MultiLineTimeSeriesChart } from '.'

describe('MultiLineTimeSeriesChart',()=>{
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })
})

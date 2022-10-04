import { render } from '@testing-library/react'

import { data } from './stories'

import { StackedAreaChart } from '.'

describe('StackedAreaChart',()=>{
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<StackedAreaChart
      data={data}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })
  it('should handle when there is no legend', () => {
    const formatter = jest.fn()
    render(<StackedAreaChart
      data={data}
      dataFormatter={formatter}
      disableLegend={true}
    />)
    expect(formatter).toBeCalled()
  })
})

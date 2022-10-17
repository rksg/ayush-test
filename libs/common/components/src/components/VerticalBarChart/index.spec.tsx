import {  mockDOMWidth, render, screen } from '@acx-ui/test-utils'

import { data } from './stories'

import { VerticalBarChart } from '.'

describe('VerticalBarChart',()=>{
  mockDOMWidth()
  it('should render correctly', () => {
    const { asFragment } = render(<VerticalBarChart
      data={data}
      xAxisName={'VerticalBarChartTest'}
    />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('VerticalBarChartTest')).toHaveLength(1)
  })
  it('should render correctly without title', () => {
    const { asFragment } = render(<VerticalBarChart
      data={data}
    />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

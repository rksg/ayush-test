import {  mockDOMWidth, render, screen } from '@acx-ui/test-utils'

import { data } from './stories'

import { DistributionChart } from '.'

describe('DistributionChart',()=>{
  mockDOMWidth()
  it('should render correctly', () => {
    const { asFragment } = render(<DistributionChart
      data={data}
      xAxisName={'DistributionChartTest'}
    />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('DistributionChartTest')).toHaveLength(1)
  })
  it('should render correctly without title', () => {
    const { asFragment } = render(<DistributionChart
      data={data}
    />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

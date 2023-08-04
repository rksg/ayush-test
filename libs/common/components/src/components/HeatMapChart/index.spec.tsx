import React from 'react'

import { render, screen } from '@acx-ui/test-utils'

import { data, tooltipFormatter, xAxisCategories } from './stories'

import { Heatmap } from '.'

describe('VerticalBarChart',()=>{
  it('should render correctly', () => {
    const { asFragment } = render(<Heatmap
      style={{ width: 100, height: 100 }}
      tooltipFormatter={tooltipFormatter}
      xAxisCategories={xAxisCategories ?? []}
      yAxisCategories={['56', '60', '116', '132']}
      data={data}
      colors={['green', 'orange', 'red']}
      min={0}
      max={5}
      title={'Heatmap'} />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('canvas')).toBeDefined()
    expect(screen.queryByText('VerticalBarChartTest')).toBeNull()
  })
})

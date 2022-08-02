import {  render, screen } from '@acx-ui/test-utils'

import { data, barColors } from './stories'

import { BarChart } from '.'

describe('BarChart',()=>{
  it('should renderer correctly for single series',async () => {
    const { asFragment } = render(<BarChart
      data={data()}
      barColors={barColors}
    />)

    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('Switch', { exact: false })).toHaveLength(5)

  })
  it('should renderer correctly for multi series', () => {
    
    const { asFragment } = render(<BarChart
      data={data(true)}
      barColors={barColors}
    />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('Switch', { exact: false })).toHaveLength(5)
  })
})

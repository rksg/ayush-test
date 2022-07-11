import { render } from '@acx-ui/test-utils'

import { data } from './stories'

import { DonutChart } from '.'

const emptyChartData = [{
  name: '', value: 0, color: 'white'
}]

describe('DonutChart', () => {
  it('should render the chart properly with data', async () => {
    const { asFragment } = render(<DonutChart data={data} title='Donut Chart'/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render the empty chart properly without data', async () => {
    const { asFragment } = render(<DonutChart data={[]}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render the empty chart when name is empty', async () => {
    const { asFragment } = render(<DonutChart data={emptyChartData}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should not render the legend when false', async () => {
    const { asFragment } = render(<DonutChart data={data} showLegend={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})


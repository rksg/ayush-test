import { render } from '@acx-ui/test-utils'

import { cssStr } from '../../theme/helper'

import { data } from './stories'

import { StackedBarChart } from '.'

const barColors = [
  '#F9C34B',
  '#EC7100',
  '#ED1C24',
  '#A00D14'
]

describe('StackedBarChart', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <StackedBarChart
        data={data}
        barColors={barColors}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should have default barColors', async () => {
    const { asFragment } = render(
      <StackedBarChart data={data} />)
    expect(asFragment().querySelector(`path[fill="${cssStr('--acx-semantics-red-50')}"]`))
      .not.toBeNull()
  })
  it('should not render labels and total count', async () => {
    const { asFragment } = render(
      <StackedBarChart
        data={data}
        barColors={barColors}
        showTotal={false}
        showLabels={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

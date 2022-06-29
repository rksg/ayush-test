import { render } from '@acx-ui/test-utils'

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
        style={{ height: 200, width: 400 }}
        data={data}
        barColors={barColors}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should not render labels and total count', async () => {
    const { asFragment } = render(
      <StackedBarChart
        style={{ height: 200, width: 400 }}
        data={data}
        barColors={barColors}
        showTotal={false}
        showLabels={false}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

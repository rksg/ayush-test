import { render } from '@acx-ui/test-utils'

import { data } from './stories'

import { VerticalStackedBarChart } from '.'

describe('VerticalBarChart',()=>{
  it('should render correctly', () => {
    const { asFragment } = render(
      <VerticalStackedBarChart data={data.data} categories={data.categories} />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<VerticalStackedBarChart
      data={data.data}
      categories={data.categories}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })
})

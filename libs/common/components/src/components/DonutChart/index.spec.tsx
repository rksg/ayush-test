import { render, screen } from '@acx-ui/test-utils'
import { formatter }      from '@acx-ui/utils'

import { cssStr } from '../../theme/helper'

import { DonutChart } from '.'

const data = [
  { value: 35, name: 'Requires Attention', color: cssStr('--acx-semantics-red-60') },
  { value: 40, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 20, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

export const topSwitchModels = [
  { value: 13, name: 'ICX7150-C12P', color: cssStr('--acx-accents-blue-30') },
  { value: 8, name: 'ICX7150-C121P', color: cssStr('--acx-accents-blue-60') },
  { value: 7, name: 'ICX7150-C57P', color: cssStr('--acx-accents-orange-25') },
  { value: 4, name: 'ICX7150-C8', color: cssStr('--acx-accents-orange-50') },
  { value: 2, name: 'ICX7150-C0', color: cssStr('--acx-semantics-yellow-40') }
]

const emptyChartData = [{
  name: '', value: 0, color: 'white'
}]

describe('DonutChart - small', () => {
  it('should render the chart properly with data', async () => {
    const { asFragment } = render(<DonutChart
      data={data}
      dataFormatter={formatter('noFormat')}
      title='Donut Chart'/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('Donut Chart').getAttribute('style'))
      .toEqual("font-size:10px;font-family:'Open Sans', sans-serif;font-weight:400;")
    expect(screen.getByText('145').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(5)
  })
  it('should render the empty chart properly without data', async () => {
    const { asFragment } = render(<DonutChart data={[]}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('0').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(1)
  })
  it('should render the empty chart when name is empty', async () => {
    const { asFragment } = render(<DonutChart data={emptyChartData}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should not render the legend when false', async () => {
    const { asFragment } = render(<DonutChart data={data}
      showLegend={false}
      dataFormatter={formatter('countFormat')}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('145').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(1)
  })
  it('should render the legend properly when formatter not available', async () => {
    const { asFragment } = render(<DonutChart data={data}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('145').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(5)
  })
})

describe('Donut Chart - large', () => {
  it('should render the chart properly with data and only title, without legend', async () => {
    const { asFragment } = render(<DonutChart
      data={data}
      type={'large'}
      onClick={jest.fn()}
      dataFormatter={formatter('noFormat')}
      title='Donut Chart'
      showLegend={false}
      showTooltipPercentage={true}
      showTotal={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('Donut Chart').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Open Sans', sans-serif;font-weight:400;")
  })
  it('should render the chart with title and subtitle passed as prop, with Labels', async () => {
    const { asFragment } = render(<DonutChart
      data={data}
      type={'large'}
      dataFormatter={formatter('noFormat')}
      title='Some Title'
      subtitle='Some Subtitle'
      showLabel={true}
      showLegend={false}
      showTooltipPercentage={true}
      showTotal={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('Some Title').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Open Sans', sans-serif;font-weight:400;")
    expect(screen.getByText('Some Subtitle').getAttribute('style'))
      .toEqual("font-size:24px;font-family:'Open Sans', sans-serif;font-weight:600;")
  })
})

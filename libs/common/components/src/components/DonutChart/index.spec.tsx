import { render, screen, mockLightTheme } from '@acx-ui/test-utils'
import { formatter }                      from '@acx-ui/utils'

import { cssStr } from '../../theme/helper'

import { DonutChart } from '.'

jest.mock('../../theme/helper', () => ({
  __esModule: true,
  cssStr: jest.fn(property => mockLightTheme[property]),
  cssNumber: jest.fn(property => parseInt(mockLightTheme[property], 10))
}))

const data = [
  { value: 35, name: 'Requires Attention', color: cssStr('--acx-semantics-red-60') },
  { value: 40, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 20, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

const emptyChartData = [{
  name: '', value: 0, color: 'white'
}]

describe('DonutChart', () => {
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


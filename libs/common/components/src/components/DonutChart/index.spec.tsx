import { useIntl } from 'react-intl'

import { render, screen } from '@acx-ui/test-utils'
import { intlFormats }    from '@acx-ui/utils'

import { cssStr }      from '../../theme/helper'
import { EventParams } from '../Chart/helper'

import { DonutChart, onChartClick } from '.'

const data = [
  { value: 35, name: 'Requires Attention', color: cssStr('--acx-semantics-red-60') },
  { value: 40, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 5000, name: 'Operational', color: cssStr('--acx-neutrals-50') },
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

describe('onChartClick', () => {
  it('should call onClick', () => {
    const onClick = jest.fn()
    onChartClick(onClick)({} as EventParams)
    expect(onClick).toBeCalledTimes(1)
  })
})

describe('DonutChart - small', () => {
  it('should render the chart properly with data', async () => {
    const { asFragment } = render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      showLegend
      title='Donut Chart'/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('Donut Chart').getAttribute('style'))
      .toEqual("font-size:10px;font-family:'Open Sans', sans-serif;font-weight:400;")
    expect(screen.getByText('5095').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(5)
  })
  it('should render the empty chart properly without data', async () => {
    const { asFragment } = render(<DonutChart style={{ width: 238, height: 176 }} data={[]}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('0').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(1)
  })
  it('should render the empty chart when name is empty', async () => {
    const { asFragment } = render(
      <DonutChart style={{ width: 238, height: 176 }} data={emptyChartData}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should not render the legend when false', async () => {
    const { asFragment } = render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      showLegend={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('5095').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(1)
  })
  it('should render the legend properly when formatter not available', async () => {
    const { asFragment } = render(<DonutChart style={{ width: 238, height: 176 }}
      data={data}
      showLegend/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('5095').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Montserrat', sans-serif;font-weight:600;")
    const numbers = await screen.findAllByText(/\d+/)
    expect(numbers.length).toEqual(5)
  })
  it('should use dataFormatter for title and legend', async () => {
    const TestDonut = () => {
      const { $t } = useIntl()
      return <DonutChart
        style={{ width: 238, height: 176 }}
        data={data}
        showLegend={true}
        dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}/>
    }
    const { asFragment } = render(<TestDonut />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    await screen.findByText(/5.1K/)
    await screen.findByText(/5K/)
  })
  it('should render legend in "name-value" format', async () => {
    render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      title='Donut Chart'
      legend={'name-value'}
      subTitle='Donut Chart subTitle'
    />)
    data.forEach(async item => {
      expect(await screen.findByText(`${item.name} - ${item.value}`)).toBeTruthy()
    })
  })
  it('should render legend as "name" format', async () => {
    render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      title='Donut Chart'
      legend={'name'}
      subTitle='Donut Chart subTitle'
    />)
    data.forEach(async item => {
      expect(await screen.findByText(item.name)).toBeTruthy()
    })
  })
  it('should render subTitle', async () => {
    render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      title='Donut Chart'
      subTitle='Donut Chart subTitle'
    />)
    await screen.findByText('Donut Chart subTitle')
  })
})

describe('Donut Chart - large', () => {
  it('should render the chart properly with data and only title, without legend', async () => {
    const { asFragment } = render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      size={'large'}
      onClick={jest.fn()}
      title='Donut Chart'
      showLegend={false}
      showTotal={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('Donut Chart').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Open Sans', sans-serif;font-weight:400;")
  })
  it('should render the chart with title and value passed as prop, with Labels', async () => {
    const { asFragment } = render(<DonutChart
      style={{ width: 238, height: 176 }}
      data={data}
      size={'large'}
      title='Some Title'
      value='100'
      showLabel={true}
      showLegend={false}
      showTotal={false}/>)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(screen.getByText('Some Title').getAttribute('style'))
      .toEqual("font-size:16px;font-family:'Open Sans', sans-serif;font-weight:400;")
    expect(screen.getByText('100').getAttribute('style'))
      .toEqual("font-size:24px;font-family:'Open Sans', sans-serif;font-weight:600;")
  })
})

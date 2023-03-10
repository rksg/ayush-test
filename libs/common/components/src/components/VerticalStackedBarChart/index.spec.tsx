import { render } from '@acx-ui/test-utils'

import { TooltipFormatterParams } from '../Chart/helper'

import { data } from './stories'

import { VerticalStackedBarChart, tooltipFormatter } from '.'

describe('VerticalBarChart',()=>{
  it('should render correctly', () => {
    const { asFragment } = render(
      <VerticalStackedBarChart data={data.data} categories={data.categories} />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('should call formatter for yAxis', () => {
    const yAxisLabelFormatter = jest.fn()
    render(<VerticalStackedBarChart
      data={data.data}
      categories={data.categories}
      yAxisLabelFormatter={yAxisLabelFormatter}
    />)
    expect(yAxisLabelFormatter).toBeCalled()
  })
})

describe('tooltipFormatter', () => {
  const parameters = [
    {
      name: 'DHCP',
      seriesName: 'Pass',
      value: 1,
      color: '#FFFFFF'
    },
    {
      name: 'Fail',
      seriesName: 'Pass',
      value: 0,
      color: '#000000'
    }
  ] as TooltipFormatterParams[]

  it('should return correct html for single series', async () => {
    const dataFormatter = jest.fn()
    const result = tooltipFormatter(dataFormatter)(parameters[0])
    expect(result).toMatchSnapshot()
    expect(dataFormatter).toBeCalledTimes(1)
  })

  it('should return correct html for multiple series', async () => {
    const dataFormatter = jest.fn()
    const result = tooltipFormatter(dataFormatter)(parameters)
    expect(result).toMatchSnapshot()
    expect(dataFormatter).toBeCalledTimes(2)
  })

  it('should return correct html when there is no dataFormatter', async () => {
    const dataFormatter = jest.fn()
    const result = tooltipFormatter()(parameters)
    expect(result).toMatchSnapshot()
    expect(dataFormatter).toBeCalledTimes(0)
  })
})


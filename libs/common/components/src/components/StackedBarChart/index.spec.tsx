import { defineMessage } from 'react-intl'

import { render } from '@acx-ui/test-utils'

import { cssStr }                 from '../../theme/helper'
import { TooltipFormatterParams } from '../Chart/helper'

import { data } from './stories'

import { StackedBarChart, tooltipFormatter } from '.'

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
        onAxisLabelClick={() => {}}
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

describe('tooltipFormatter', () => {
  const singleparameters = {
    color: 'color1', value: [10]
  } as TooltipFormatterParams
  it('should return correct Html string for single value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(tooltipFormatter(formatter)(singleparameters))
      .toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should handle custom format', async () => {
    const format = defineMessage({
      defaultMessage: `<span>{name}</span>
        <br></br>
        <space>
          <b>{formattedValue} {value, plural, one {unit} other {units} }</b>
        </space>
      `
    })
    const formatter = jest.fn(value => `formatted-${value}`)
    expect(tooltipFormatter(
      formatter,
      format
    )({ ...singleparameters, percent: 10 })).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should handle when dataFormatter is null', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(tooltipFormatter()(singleparameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(0)
  })
})

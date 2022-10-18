import { render, screen } from '@acx-ui/test-utils'

import { data } from './stories'

import { VerticalBarChart, tooltipFormatter } from '.'

import type { TooltipComponentFormatterCallbackParams } from 'echarts'

describe('VerticalBarChart',()=>{
  it('should render correctly', () => {
    const { asFragment } = render(<VerticalBarChart data={data} />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.queryByText('VerticalBarChartTest')).toBeNull()
  })

  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<VerticalBarChart
      data={data}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })

  it('should render with title', () => {
    render(<VerticalBarChart
      data={data}
      xAxisName={'VerticalBarChart x-axis name'}
    />)
    expect(screen.getAllByText('VerticalBarChart x-axis name')).toHaveLength(1)
  })

  describe('tooltipFormatter', () => {
    it('should return correct Html string', async () => {
      const params = [{
        data: ['-75', 1100],
        dimensionNames: ['RSS', 'Samples']
      }] as unknown as TooltipComponentFormatterCallbackParams
      const formatter = jest.fn(value=>`formatted-${value}`)
      expect(tooltipFormatter(formatter, true)(params))
        .toMatchSnapshot()
      expect(formatter).toBeCalledTimes(1)
    })

    it('should return correct Html when showTooltipName is false', async () => {
      const params = [{
        data: ['-75', 1100],
        dimensionNames: ['RSS', 'Samples']
      }] as unknown as TooltipComponentFormatterCallbackParams
      const formatter = jest.fn(value=>`formatted-${value}`)
      expect(tooltipFormatter(formatter, false)(params).match(/Samples/)).toBeNull()
    })
  })
})

import {  render, screen } from '@acx-ui/test-utils'

import { EventParams } from '../Chart'

import { data, barColors } from './stories'

import { BarChart, handleOnClick } from '.'

const timeYAxisData = {
  dimensions: [
    'time',
    'Total Traffic'
  ],
  source: [
    [
      '2024-12-18T02:30:00.000Z',
      52763632
    ],
    [
      '2024-12-18T03:00:00.000Z',
      53073370
    ],
    [
      '2024-12-18T03:30:00.000Z',
      52407978
    ],
    [
      '2024-12-18T04:00:00.000Z',
      53007648
    ],
    [
      '2024-12-18T04:30:00.000Z',
      52711471
    ],
    [
      '2024-12-18T05:00:00.000Z',
      126562118
    ],
    [
      '2024-12-18T05:30:00.000Z',
      54993026
    ]
  ],
  seriesEncode: [
    {
      x: 'Total Traffic',
      y: 'time',
      seriesName: 'Total Traffic'
    }
  ],
  multiSeries: false
}

describe('BarChart',()=>{
  it('should render correctly for single series',async () => {
    const { asFragment } = render(<BarChart
      data={data()}
      barColors={barColors}
    />)

    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('Switch', { exact: false })).toHaveLength(5)

  })
  it('should render correctly for single series if yAxisType is time',async () => {
    const { asFragment } = render(<BarChart
      style={{ width: '100%', height: '100%' }}
      data={timeYAxisData}
      yAxisType={'time' as unknown as undefined}
    />)

    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(await screen.findByText('54993026')).toBeVisible()
  })
  it('should render correctly for multi series', () => {
    const onClick = jest.fn()
    const { asFragment } = render(<BarChart
      data={data(true)}
      barColors={barColors}
      onClick={onClick}
    />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('Switch', { exact: false })).toHaveLength(5)
  })

  describe('onChartClick', () => {
    it('should call onClick', () => {
      const onClick = jest.fn()
      handleOnClick(onClick)({} as EventParams)
      expect(onClick).toBeCalledTimes(1)
    })
  })
})

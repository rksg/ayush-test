import {  render, screen } from '@acx-ui/test-utils'

import { EventParams } from '../Chart'

import { data } from './stories'

import { BarChart, handleOnClick } from '.'

const timeYAxisData = {
  dimensions: [
    'time',
    'Total Traffic'
  ],
  source: [
    ['2024-12-18T02:30:00.000Z', 52763632],
    ['2024-12-18T03:00:00.000Z', 53073370],
    ['2024-12-18T03:30:00.000Z', 52407978],
    ['2024-12-18T04:00:00.000Z', 53007648],
    ['2024-12-18T04:30:00.000Z', 52711471],
    ['2024-12-18T05:00:00.000Z', 126562118],
    ['2024-12-18T05:30:00.000Z', 54993026],
    ['2024-12-18T05:30:00.000Z', 54993028],
    ['2024-12-18T05:30:00.000Z', 54993029],
    ['2024-12-18T05:30:00.000Z', 54993030],
    ['2024-12-18T05:30:00.000Z', 54993031],
    ['2024-12-18T06:00:00.000Z', 55012345],
    ['2024-12-18T06:30:00.000Z', 55034567],
    ['2024-12-18T07:00:00.000Z', 55056789],
    ['2024-12-18T07:30:00.000Z', 55078901],
    ['2024-12-18T08:00:00.000Z', 55101234],
    ['2024-12-18T08:30:00.000Z', 55123456],
    ['2024-12-18T09:00:00.000Z', 55145678],
    ['2024-12-18T09:30:00.000Z', 55167890],
    ['2024-12-18T10:00:00.000Z', 55189012],
    ['2024-12-18T10:30:00.000Z', 55212345],
    ['2024-12-18T11:00:00.000Z', 55234567],
    ['2024-12-18T11:30:00.000Z', 55256789],
    ['2024-12-18T12:00:00.000Z', 55278901],
    ['2024-12-18T12:30:00.000Z', 55301234],
    ['2024-12-18T13:00:00.000Z', 55323456],
    ['2024-12-18T13:30:00.000Z', 55345678],
    ['2024-12-18T14:00:00.000Z', 55367890],
    ['2024-12-18T14:30:00.000Z', 55389012],
    ['2024-12-18T15:00:00.000Z', 55412345],
    ['2024-12-18T15:30:00.000Z', 55434567]
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
    />)

    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('Switch', { exact: false })).toHaveLength(5)
  })
  it('should render correctly for single series with custom colors',async () => {
    const barColors = ['#ff0000', '#00ff00', '#0000ff']
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

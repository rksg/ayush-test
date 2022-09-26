import {  render, screen } from '@acx-ui/test-utils'

import { EventParams } from '../Chart'

import { data, barColors } from './stories'

import { BarChart, handleOnClick } from '.'

describe('BarChart',()=>{
  it('should renderer correctly for single series',async () => {
    const { asFragment } = render(<BarChart
      data={data()}
      barColors={barColors}
    />)

    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.getAllByText('Switch', { exact: false })).toHaveLength(5)

  })
  it('should renderer correctly for multi series', () => {
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

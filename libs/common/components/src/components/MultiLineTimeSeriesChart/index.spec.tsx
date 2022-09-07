import { render, screen } from '@testing-library/react'

import { getSeriesData } from './stories'

import { MultiLineTimeSeriesChart } from '.'

import { BrowserRouter } from 'react-router-dom'


describe('MultiLineTimeSeriesChart', () => {
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
  })

  it('should render with additional props', () => {
    const formatter = jest.fn()
    const partialIncident = [
      {
        id: '123',
        code: 'radius'
      },
      {
        id: '456',
        code: 'eap'
      }
    ]
    const { asFragment } = render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
        disableLegend={true}
        marker={partialIncident}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

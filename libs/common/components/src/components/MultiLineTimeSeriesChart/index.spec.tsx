import { render }        from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { getSeriesData } from './stories'

import { MultiLineTimeSeriesChart } from '.'



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
    render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
        disableLegend={true}
        marker={partialIncident}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
  })
})

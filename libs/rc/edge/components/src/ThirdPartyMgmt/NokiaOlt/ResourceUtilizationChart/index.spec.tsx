import React from 'react'

import { render, screen } from '@acx-ui/test-utils'

import { EdgeOltResourceUtilizationWidget } from './index'
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  MultiLineTimeSeriesChart: () => <div data-testid='MultiLineTimeSeriesChart'>
    MultiLineTimeSeriesChart
  </div>
}))
describe('EdgeOltResourceUtilizationWidget', () => {

  it('renders chart correctly', async () => {
    render(<EdgeOltResourceUtilizationWidget />)
    await screen.findByText('Resource Utilization')
    const chart = screen.getByText('MultiLineTimeSeriesChart')
    expect(chart).toBeInTheDocument()
  })
})
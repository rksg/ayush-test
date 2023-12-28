import { render, screen }       from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import { IncidentBySeverity } from '.'

jest.mock('./IncidentBySeverityBarChart', () => ({
  IncidentBySeverityBarChart: () => <div data-testid='IncidentBySeverityBarChart' />
}))
jest.mock('./IncidentBySeverityDonutChart', () => ({
  IncidentBySeverityDonutChart: () => <div data-testid='IncidentBySeverityDonutChart' />
}))

describe('IncidentBySeverity', () => {
  const filters: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  it('renders type=bar', async () => {
    render(<IncidentBySeverity type='bar' filters={filters} />)

    expect(await screen.findByTestId('IncidentBySeverityBarChart')).toBeVisible()
  })
  it('renders type=donut', async () => {
    render(<IncidentBySeverity type='donut' filters={filters} />)

    expect(await screen.findByTestId('IncidentBySeverityDonutChart')).toBeVisible()
  })
})

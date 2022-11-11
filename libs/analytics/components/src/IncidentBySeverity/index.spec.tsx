
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { render, screen }  from '@acx-ui/test-utils'
import { DateRange }       from '@acx-ui/utils'

import { IncidentBySeverity } from '.'

jest.mock('./IncidentBySeverityBarChart', () => ({
  IncidentBySeverityBarChart: () => <div data-testid='IncidentBySeverityBarChart' />
}))
jest.mock('./IncidentBySeverityDonutChart', () => ({
  IncidentBySeverityDonutChart: () => <div data-testid='IncidentBySeverityDonutChart' />
}))

describe('IncidentBySeverity', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  } as AnalyticsFilter

  it('renders type=bar', async () => {
    render(<IncidentBySeverity type='bar' filters={filters} />)

    expect(await screen.findByTestId('IncidentBySeverityBarChart')).toBeVisible()
  })
  it('renders type=donut', async () => {
    render(<IncidentBySeverity type='donut' filters={filters} />)

    expect(await screen.findByTestId('IncidentBySeverityDonutChart')).toBeVisible()
  })
})

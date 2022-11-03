
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { render, screen }  from '@acx-ui/test-utils'
import { DateRange }       from '@acx-ui/utils'

import AnalyticsWidgets from './Widgets'

jest.mock('@acx-ui/analytics/components', () => ({
  IncidentBySeverity: () => <div data-testid='IncidentBySeverity' />
}))

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filters: {}
} as AnalyticsFilter


test('should render Venue Overview Incidents Widget', async () => {
  render(<AnalyticsWidgets name='venueIncidentsDonut' filters={filters} />)
  expect(await screen.findByTestId('IncidentBySeverity')).toBeVisible()
})

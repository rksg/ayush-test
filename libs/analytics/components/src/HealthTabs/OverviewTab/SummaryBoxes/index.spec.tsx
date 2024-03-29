import { BrowserRouter as Router }                                     from '@acx-ui/react-router-dom'
import { Provider, store, dataApiURL }                                 from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                                        from '@acx-ui/utils'
import { DateRange }                                                   from '@acx-ui/utils'


import {
  incidentSummaryFixture,
  incidentSummaryNoDataFixture,
  trafficSummaryFixture,
  trafficSummaryNoDataFixture } from './__tests__/fixtures'
import { api } from './services'

import { SummaryBoxes } from '.'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('SummaryBoxes', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
  })
  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficSummary', { data: trafficSummaryFixture })
    mockGraphqlQuery(dataApiURL, 'IncidentSummary', { data: incidentSummaryFixture })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficSummary', { data: trafficSummaryNoDataFixture })
    mockGraphqlQuery(dataApiURL, 'IncidentSummary', { data: incidentSummaryNoDataFixture })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})

import '@testing-library/jest-dom'

import { dataApiURL }      from '@acx-ui/analytics/services'
import { IncidentFilter }  from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  cleanup
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { headerApi, barchartApi } from './services'

import IncidentsDashboardWidget from '.'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

describe('Incident', () => {
  beforeEach(() => {
    store.dispatch(headerApi.util.resetApiState())
    store.dispatch(barchartApi.util.resetApiState())
  })

  afterEach(() => cleanup())

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentDashboardWidget', {
      data: { network: { hierarchyNode: {
        P1Count: 1,
        P1Impact: 1,
        P2Count: 1,
        P2Impact: 1,
        P3Count: 1,
        P3Impact: 1,
        P4Count: 1,
        P4Impact: 1
      } } }
    })

    render(<Provider><IncidentsDashboardWidget filters={filters} /></Provider>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })
})
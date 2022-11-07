import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { IncidentFilter }                   from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { api, IncidentsBySeverityData } from '../services'

import VenueIncidentsWidget from '.'

const sample = { P1: 0, P2: 2, P3: 3, P4: 4 } as IncidentsBySeverityData

describe('Venue Overview Incidents Widget', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'zone', name: 'some-venue' }],
    range: DateRange.last24Hours
  } as IncidentFilter
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    render(
      <Provider>
        <VenueIncidentsWidget filters={filters} />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    const { asFragment } = render(
      <Provider>
        <VenueIncidentsWidget filters={filters} />
      </Provider>
    )
    await screen.findByText('Incidents')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      error: new Error('something went wrong!')
    })
    render(
      <Provider>
        <VenueIncidentsWidget filters={filters} />
      </Provider>
    )
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})

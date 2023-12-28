import _ from 'lodash'

import { fakeIncident1 }               from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  render,
  screen,
  mockGraphqlQuery,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { api } from './services'

import { IncidentDetails } from '.'

jest.mock('.', () => ({
  ...jest.requireActual('.'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))

jest.mock('./NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))

jest.mock('./TimeSeries', () => ({
  TimeSeries: () => <div data-testid='timeSeries' />
}))

describe('incident details', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render incident details correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentCode',
      { data: { incident: _.pick(fakeIncident1, ['code', 'startTime', 'endTime']) } } )
    mockGraphqlQuery(dataApiURL, 'IncidentDetails', { data: { incident: fakeIncident1 } } )
    const params = { incidentId: fakeIncident1.id }
    const { asFragment } = render(<Provider>
      <IncidentDetails />
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render incident details correctly when there is impacted range', async () => {
    const fakeIncident2 = { ...fakeIncident1, code: 'p-airtime-b-24g-high' }
    mockGraphqlQuery(dataApiURL, 'IncidentCode',
      { data: { incident: _.pick(fakeIncident2, ['code', 'startTime', 'endTime']) } } )
    mockGraphqlQuery(dataApiURL, 'IncidentDetails', { data: { incident: fakeIncident2 } } )
    const params = { incidentId: fakeIncident2.id }
    const { asFragment } = render(<Provider>
      <IncidentDetails />
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(asFragment()).toMatchSnapshot()
  })
})

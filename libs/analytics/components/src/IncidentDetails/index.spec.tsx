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

  it('should render Incident Details Page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentDetails', { data: { incident: fakeIncident1 } } )
    const params = {
      incidentId: fakeIncident1.id
    }
    const { asFragment } = render(<Provider>
      <IncidentDetails />
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(asFragment()).toMatchSnapshot()
  })
})

import { dataApiURL }         from '@acx-ui/analytics/services'
import { fakeIncident1 }      from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  render,
  screen,
  mockGraphqlQuery,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { api } from './services'

import IncidentDetailsPage from '.'

jest.mock('../IncidentDetails/IncidentAttributes', () => ({
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
      <IncidentDetailsPage />
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(asFragment()).toMatchSnapshot()
  })
})

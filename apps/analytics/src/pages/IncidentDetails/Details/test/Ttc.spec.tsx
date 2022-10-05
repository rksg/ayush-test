import { dataApiURL }                                     from '@acx-ui/analytics/services'
import { fakeIncident1, mockFakeIncident }                from '@acx-ui/analytics/utils'
import { Provider }                                       from '@acx-ui/store'
import { mockDOMWidth, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { Ttc } from '../Ttc'

import { mockTimeSeries } from './__tests__/fixtures'

jest.mock('../../IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))
jest.mock('../../TimeSeries')

describe('ttc', () => {
  mockDOMWidth()
  mockTimeSeries()
  it('should render correctly', () => {
    const params = { incidentId: fakeIncident1.id }
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: {} } }
    })
    const { asFragment } = render(<Provider>
      <Ttc {...mockFakeIncident('ttc')} />
    </Provider>, { route: { params } })
    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('networkImpact')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

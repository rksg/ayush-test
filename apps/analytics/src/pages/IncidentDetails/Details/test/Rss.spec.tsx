import { fakeIncident1, mockFakeIncident } from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { mockDOMWidth, render, screen }   from '@acx-ui/test-utils'

import { Rss } from '../Rss'

jest.mock('../../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))
jest.mock('../../IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('p-cov-clientrssi-low', () => {
  mockDOMWidth()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <Rss {...mockFakeIncident('p-cov-clientrssi-low')} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('networkImpact')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

import { fakeIncident1, mockFakeIncident } from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { mockAutoSizer, render, screen }   from '@acx-ui/test-utils'

import { Ttc } from '../Ttc'

jest.mock('../../IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('ttc', () => {
  mockAutoSizer()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <Ttc {...mockFakeIncident('ttc')} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('networkImpact')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

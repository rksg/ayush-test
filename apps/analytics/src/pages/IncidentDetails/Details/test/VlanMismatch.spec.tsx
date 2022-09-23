import { fakeIncident1, mockFakeIncident } from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { mockAutoSizer, render, screen }   from '@acx-ui/test-utils'

import { VlanMismatch } from '../VlanMismatch'

jest.mock('../../IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('i-switch-vlan-mismatch', () => {
  mockAutoSizer()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <VlanMismatch {...mockFakeIncident('i-switch-vlan-mismatch')} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

import { fakeIncident1, mockFakeIncident } from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { mockAutoSizer, render, screen }   from '@acx-ui/test-utils'

import { PoePd } from '../PoePd'

jest.mock('../../IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('i-switch-poe-pd', () => {
  mockAutoSizer()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <PoePd {...mockFakeIncident('i-switch-poe-pd')} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

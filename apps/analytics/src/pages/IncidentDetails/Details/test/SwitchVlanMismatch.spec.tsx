import { fakeIncidentVlan }             from '@acx-ui/analytics/utils'
import { Provider }                     from '@acx-ui/store'
import { mockDOMWidth, render, screen } from '@acx-ui/test-utils'

import { SwitchVlanMismatch } from '../SwitchVlanMismatch'

jest.mock('../../IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('i-switch-vlan-mismatch', () => {
  mockDOMWidth()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncidentVlan.id
    }

    const { asFragment } = render(<Provider>
      <SwitchVlanMismatch {...fakeIncidentVlan} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

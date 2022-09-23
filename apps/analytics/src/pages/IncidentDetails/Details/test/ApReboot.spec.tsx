import { fakeIncident1, mockFakeIncident } from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { mockAutoSizer, render, screen }   from '@acx-ui/test-utils'

import { ApReboot } from '../ApReboot'

jest.mock('../../IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('i-apserv-high-num-reboots', () => {
  mockAutoSizer()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <ApReboot {...mockFakeIncident('i-apserv-high-num-reboots')} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('i-apserv-continuous-reboots', () => {
  mockAutoSizer()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <ApReboot {...mockFakeIncident('i-apserv-continuous-reboots')} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

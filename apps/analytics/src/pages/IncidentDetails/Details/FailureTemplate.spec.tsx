import { fakeIncident1 }                 from '@acx-ui/analytics/utils'
import { Provider }                      from '@acx-ui/store'
import { mockAutoSizer, render, screen } from '@acx-ui/test-utils'

import { IncidentDetailsTemplate } from './FailureTemplate'

jest.mock('../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))
jest.mock('../IncidentDetails/IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../IncidentDetails/TimeSeries', () => ({
  TimeSeries: () => <div data-testid='timeSeries' />
}))

describe('IncidentDetailsTemplate', () => {
  mockAutoSizer()

  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <IncidentDetailsTemplate {...fakeIncident1} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('timeSeries')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

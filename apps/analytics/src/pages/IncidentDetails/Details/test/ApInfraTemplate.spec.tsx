import { fakeIncident1 }                 from '@acx-ui/analytics/utils'
import { Provider }                      from '@acx-ui/store'
import { mockAutoSizer, render, screen } from '@acx-ui/test-utils'

import { ApInfraTemplate } from '../ApInfraTemplate'

jest.mock('../../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))
jest.mock('../../IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))

describe('ApInfraTemplate', () => {
  mockAutoSizer()

  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <ApInfraTemplate {...fakeIncident1} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

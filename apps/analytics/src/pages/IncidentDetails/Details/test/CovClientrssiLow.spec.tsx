import { fakeIncidentRss }              from '@acx-ui/analytics/utils'
import { Provider }                     from '@acx-ui/store'
import { mockDOMWidth, render, screen } from '@acx-ui/test-utils'

import { CovClientrssiLow } from '../CovClientrssiLow'

import { mockNetworkImpact } from './__tests__/fixtures'

jest.mock('../../NetworkImpact')
jest.mock('../../IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('p-cov-clientrssi-low', () => {
  mockDOMWidth()
  mockNetworkImpact()

  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncidentRss.id
    }

    const { asFragment } = render(<Provider>
      <CovClientrssiLow {...fakeIncidentRss} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('networkImpact')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

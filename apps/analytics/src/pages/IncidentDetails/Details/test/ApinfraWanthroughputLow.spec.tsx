import { fakeIncidentApInfraWanthroughput } from '@acx-ui/analytics/utils'
import { Provider }                         from '@acx-ui/store'
import { mockDOMWidth, render, screen }     from '@acx-ui/test-utils'

import { ApinfraWanthroughputLow } from '../ApinfraWanthroughputLow'

jest.mock('../../IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

describe('i-apinfra-poe-low', () => {
  mockDOMWidth()
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncidentApInfraWanthroughput.id
    }

    const { asFragment } = render(<Provider>
      <ApinfraWanthroughputLow {...fakeIncidentApInfraWanthroughput}/>
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

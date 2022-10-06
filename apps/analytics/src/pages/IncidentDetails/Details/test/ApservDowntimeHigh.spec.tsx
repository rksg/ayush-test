import { fakeIncidentDowntimeHigh }     from '@acx-ui/analytics/utils'
import { Provider }                     from '@acx-ui/store'
import { mockDOMWidth, render, screen } from '@acx-ui/test-utils'

import { ApservDowntimeHigh } from '../ApservDowntimeHigh'

import { mockTimeSeries } from './__tests__/fixtures'

jest.mock('../../IncidentAttributes', () => ({
  ...jest.requireActual('../../IncidentDetails/IncidentAttributes'),
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))
jest.mock('../../Insights', () => ({
  Insights: () => <div data-testid='insights' />
}))

jest.mock('../../TimeSeries')

describe('i-apserv-downtime-high', () => {
  mockDOMWidth()
  mockTimeSeries()

  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncidentDowntimeHigh.id
    }

    const { asFragment } = render(<Provider>
      <ApservDowntimeHigh {...fakeIncidentDowntimeHigh}/>
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(screen.getByTestId('insights')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

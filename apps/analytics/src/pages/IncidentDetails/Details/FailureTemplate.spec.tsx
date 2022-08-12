import { fakeIncident1 } from '@acx-ui/analytics/utils'
import { Provider }      from '@acx-ui/store'
import { render }        from '@acx-ui/test-utils'

import { IncidentDetailsTemplate } from './FailureTemplate'

jest.mock('../IncidentDetails/IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))

describe('IncidentDetailsTemplate', () => {
  it('should render correctly', () => {
    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <IncidentDetailsTemplate {...fakeIncident1} />
    </Provider>, { route: { params } })

    expect(asFragment()).toMatchSnapshot()
  })
})

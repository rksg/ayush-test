import { rest } from 'msw'

import { fakeIncident1 }                             from '@acx-ui/analytics/utils'
import { Provider }                                  from '@acx-ui/store'
import { mockAutoSizer, render, screen, mockServer } from '@acx-ui/test-utils'

import { IncidentDetailsTemplate } from './FailureTemplate'

jest.mock('../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))
jest.mock('../IncidentDetails/IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))

describe('IncidentDetailsTemplate', () => {
  mockAutoSizer()

  it('should render correctly', () => {
    mockServer.use(
      rest.get(
        '/t/tenantId/analytics/incidents/:incidentId',
        (req, res, ctx) => {
          return res(ctx.json(fakeIncident1))
        }
      )
    )

    const params = {
      incidentId: fakeIncident1.id
    }

    const { asFragment } = render(<Provider>
      <IncidentDetailsTemplate {...fakeIncident1} />
    </Provider>, { route: { params } })

    expect(screen.getByTestId('incidentAttributes')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

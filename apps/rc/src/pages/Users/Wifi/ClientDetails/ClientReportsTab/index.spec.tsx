import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { ClientReportsTab } from './'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid='reportPage' />
}))

describe('ClientReportsTab', () => {
  const params = {
    tenantId: 'tenant-id',
    clientId: 'client-id'
  }

  it('should render correctly', async () => {
    render(
      <Provider>
        <ClientReportsTab />
      </Provider>, { route: { params } })
    expect(await screen.findByTestId('reportPage')).toBeTruthy()
  })

})

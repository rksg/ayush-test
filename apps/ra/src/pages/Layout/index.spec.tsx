import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import Layout from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useUserProfileContext: () => ({ data: {
    accountId: '0015000000GlI7SAAV',
    permissions: {},
    tenants: [
      { id: '0012h00000NrljgAAB', name: 'Company 1' },
      { id: '0015000000GlI7SAAV', name: 'Company 2' }
    ],
    firstName: 'firstName',
    lastName: 'lastName'
  } })
}))

describe('Layout', () => {
  it('should render layout correctly', async () => {
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 2')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleSolid')).toBeVisible()
    expect(await screen.findByText('FL')).toBeVisible() // firstName + lastName
  })
})

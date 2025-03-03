import { Provider }           from '@acx-ui/store'
import { screen, render }     from '@acx-ui/test-utils'
import { raiPermissionsList } from '@acx-ui/user'

import Layout from '.'

const mockedProfile = jest.fn()
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: () => mockedProfile()
}))

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  MelissaBot: () => <div data-testid='MelissaBot' />
}))

describe('Layout', () => {
  const permissions = Object.keys(raiPermissionsList)
    .reduce((permissions, name) => ({ ...permissions, [name]: true }), {})
  beforeEach(() => {
    jest.restoreAllMocks()
  })
  it('should render layout correctly with multiple accounts', async () => {
    mockedProfile.mockImplementation(() => ({
      accountId: '0015000000GlI7SAAV',
      tenants: [
        { id: '0012h00000NrljgAAB', name: 'Company 1', permissions: {} },
        { id: '0015000000GlI7SAAV', name: 'Company 2', permissions: {} }
      ],
      firstName: 'firstName',
      lastName: 'lastName',
      selectedTenant: { id: '0015000000GlI7SAAV', name: 'Company 2', permissions },
      invitations: []
    }))
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 2')).toBeVisible()
    expect(screen.getByTestId('CaretDownSolid')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleSolid')).toBeVisible()
    expect(await screen.findByText('FL')).toBeVisible() // firstName + lastName
  })
  it('should render layout correctly with single account with no invitation', async () => {
    mockedProfile.mockImplementation(() => ({
      accountId: '0012h00000NrljgAAB',
      tenants: [
        { id: '0012h00000NrljgAAB', name: 'Company 1', permissions: {} }
      ],
      firstName: 'firstName',
      lastName: 'lastName',
      selectedTenant: { id: '0012h00000NrljgAAB', name: 'Company 1', permissions },
      invitations: []
    }))
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 1')).toBeVisible()
    expect(screen.queryByTestId('CaretDownSolid')).not.toBeInTheDocument()
    expect(await screen.findByTestId('QuestionMarkCircleSolid')).toBeVisible()
    expect(await screen.findByText('FL')).toBeVisible() // firstName + lastName
  })
  it('should render layout correctly with single account with invitation', async () => {
    mockedProfile.mockImplementation(() => ({
      accountId: '0012h00000NrljgAAB',
      tenants: [
        { id: '0012h00000NrljgAAB', name: 'Company 1', permissions: {} }
      ],
      firstName: 'firstName',
      lastName: 'lastName',
      selectedTenant: { id: '0012h00000NrljgAAB', name: 'Company 1', permissions },
      invitations: [{
        accountId: '0015000000GlI7SAAV',
        resourceGroupId: 'rg1',
        role: 'admin',
        type: 'tenant',
        firstName: 'firstName',
        lastName: 'lastName'
      }]
    }))
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 1')).toBeVisible()
    expect(screen.queryByTestId('CaretDownSolid')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleSolid')).toBeVisible()
    expect(await screen.findByText('FL')).toBeVisible() // firstName + lastName
  })
})

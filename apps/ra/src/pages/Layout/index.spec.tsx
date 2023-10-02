import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import Layout from '.'

const mockedProfile = jest.fn()
const mockedNavigate = jest.fn()
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: () => mockedProfile()
}))
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => () => mockedNavigate()
}))

describe('Layout', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })
  const permissions = {
    'view-analytics': true,
    'view-report-controller-inventory': true,
    'view-data-explorer': true,
    'manage-service-guard': true,
    'manage-call-manager': true,
    'manage-mlisa': true,
    'manage-occupancy': true,
    'manage-label': true,
    'manage-tenant-settings': true,
    'manage-config-recommendation': true,
    'franchisor': true
  }
  it('should render layout correctly with multiple accounts', async () => {
    mockedProfile.mockImplementation(() => ({
      accountId: '0015000000GlI7SAAV',
      tenants: [
        { id: '0012h00000NrljgAAB', name: 'Company 1' },
        { id: '0015000000GlI7SAAV', name: 'Company 2' }
      ],
      firstName: 'firstName',
      lastName: 'lastName',
      selectedTenant: { id: '0015000000GlI7SAAV', name: 'Company 2', permissions }
    }))
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 2')).toBeVisible()
    expect(screen.getByTestId('CaretDownSolid')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleSolid')).toBeVisible()
    expect(await screen.findByText('FL')).toBeVisible() // firstName + lastName
  })
  it('should render layout correctly with single account', async () => {
    mockedProfile.mockImplementation(() => ({
      accountId: '0012h00000NrljgAAB',
      tenants: [
        { id: '0012h00000NrljgAAB', name: 'Company 1' }
      ],
      firstName: 'firstName',
      lastName: 'lastName',
      selectedTenant: { id: '0012h00000NrljgAAB', name: 'Company 1', permissions }
    }))
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 1')).toBeVisible()
    expect(screen.queryByTestId('CaretDownSolid')).not.toBeInTheDocument()
    expect(await screen.findByTestId('QuestionMarkCircleSolid')).toBeVisible()
    expect(await screen.findByText('FL')).toBeVisible() // firstName + lastName
  })
  it('should select account correctly', async () => {
    mockedProfile.mockImplementation(() => ({
      accountId: '0015000000GlI7SAAV',
      tenants: [
        { id: '0012h00000NrljgAAB', name: 'Company 1' },
        { id: '0015000000GlI7SAAV', name: 'Company 2' }
      ],
      firstName: 'firstName',
      lastName: 'lastName',
      selectedTenant: { id: '0015000000GlI7SAAV', name: 'Company 2', permissions }
    }))
    render(<Layout />, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Company 2')).toBeVisible()
    expect(screen.queryByText('Company 1')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('CaretDownSolid'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Company 1' }))
    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Company 1')).toBeVisible()
  })
})

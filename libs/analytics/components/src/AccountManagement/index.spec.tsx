import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { AccountManagement, AccountManagementTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../Support', () => ({
  ...jest.requireActual('../Support'),
  Support: () => <div data-testid='Support' />
}))


jest.mock('../OnboardedSystems', () => ({
  ...jest.requireActual('../OnboardedSystems'),
  Support: () => <div data-testid='OnboardedSystems' />
}))

describe('AccountManagement', () => {
  it('should render', async () => {
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Onboarded Systems')).toBeVisible()
    expect(await screen.findByText('Users')).toBeVisible()
    expect(await screen.findByText('Labels')).toBeVisible()
    expect(await screen.findByText('Resource Groups')).toBeVisible()
    expect(await screen.findByText('Support')).toBeVisible()
    expect(await screen.findByText('Licenses')).toBeVisible()
    expect(await screen.findByText('Schedules')).toBeVisible()
    expect(await screen.findByText('Webhooks')).toBeVisible()
  })
  it('should handle tab click', async () => {
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Onboarded Systems'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/admin/onboarded', hash: '', search: ''
    }))
  })
})

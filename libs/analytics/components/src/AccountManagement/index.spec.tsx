import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { AccountManagement, AccountManagementTabEnum } from '.'

jest.mock('../Support', () => ({
  ...jest.requireActual('../Support'),
  Support: () => <div data-testid='Support' />
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
})

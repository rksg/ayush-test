import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { AccountManagement, AccountManagementTabEnum } from '.'

jest.mock('../Support', () => ({
  ...jest.requireActual('../Support'),
  Support: () => <div data-testid='Support' />
}))

describe('AccountManagement', () => {
  it('should render Support', async () => {
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('Support')).toBeVisible()
  })
})

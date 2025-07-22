
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ConnectedClientsTable } from '.'

const params = { tenantId: 'tenant-id' }

jest.mock('./RbacClientsTable', () => ({
  RbacClientsTable: () => <div data-testid='RbacClientsTable' />
}))

describe('Connected Clients Table', () => {
  it('should render the new RBAC table when enable RBAC API', async () => {
    render(
      <Provider>
        <ConnectedClientsTable
          showAllColumns={true}
          setConnectedClientCount={jest.fn()}
          searchString={''}/>
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/clients' }
      })

    expect((await screen.findByTestId('RbacClientsTable'))).toBeVisible()
  })

})


import { useIsSplitOn, Features  } from '@acx-ui/feature-toggle'
import { Provider }                from '@acx-ui/store'
import { render, screen }          from '@acx-ui/test-utils'

import { ConnectedClientsTable } from '.'

const params = { tenantId: 'tenant-id' }

jest.mock('./ClientsTable', () => ({
  ClientsTable: () => <div data-testid='ClientsTable' />
}))

jest.mock('./RbacClientsTable', () => ({
  RbacClientsTable: () => <div data-testid='RbacClientsTable' />
}))

describe('Connected Clients Table', () => {
  it('should render the original table when disable RBAC API', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API)
    render(
      <Provider>
        <ConnectedClientsTable
          showAllColumns={true}
          setConnectedClientCount={jest.fn()}
          searchString={''}/>
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/clients' }
      })

    expect((await screen.findByTestId('ClientsTable'))).toBeVisible()
  })

  it('should render the new RBAC table when enable RBAC API', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API)
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

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { NetworkClientsTab } from '.'

jest.mock('../../ClientDualTable', () => ({
  ClientDualTable: () => <div data-testid='ClientDualTable' />
}))

describe('NetworkClientsTab', () => {
  it('should render successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', activeTab: 'clients' }

    render(
      <Provider>
        <NetworkClientsTab />
      </Provider>, {
        route: { params }
      })

    await waitFor(async ()=>{
      expect(await screen.findByTestId('ClientDualTable')).toBeVisible()
    })
  })
})

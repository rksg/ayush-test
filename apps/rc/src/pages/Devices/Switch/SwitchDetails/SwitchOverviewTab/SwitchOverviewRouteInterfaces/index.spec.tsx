import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { SwitchOverviewRouteInterfaces } from './'

jest.mock('@acx-ui/rc/components', () => ({
  SwitchVeTable: () => <div data-testid='SwitchVeTable' />
}))

describe('SwitchOverviewRouteInterfaces', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber'
  }

  it('should render correctly', async () => {
    render(
      <Provider>
        <SwitchOverviewRouteInterfaces />
      </Provider>, { route: { params } })
    expect(await screen.findByTestId('SwitchVeTable')).toBeTruthy()
  })

})

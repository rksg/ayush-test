import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockedTenantId } from '../__tests__/fixtures'

import { LbsServerProfileDrawer } from './LbsServerProfileDrawer'

describe('Add Lbs Server Profile Drawer', () => {
  const params = { tenantId: mockedTenantId }

  it('should render add Lbs Server Profile drawer correctly', async () => {
    render(
      <Provider>
        <LbsServerProfileDrawer
          visible={true}
          setVisible={jest.fn()}
          handleSave={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Location Based Service Server')).toBeVisible()

    expect(screen.getByText('Profile Name')).toBeVisible()
    expect(screen.getByText('LBS Venue Name')).toBeVisible()
    expect(screen.getByText('Server Address')).toBeVisible()
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Password')).toBeVisible()

    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})
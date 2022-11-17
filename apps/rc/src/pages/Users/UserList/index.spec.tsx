import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import UserList from '.'

describe('UserList', () => {
  const params = { tenantId: 'tenant-id' }

  it('should render list correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <UserList />
      </Provider>, {
        route: { params, path: '/:tenantId/users/clients' }
      })

    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(await screen.findByRole('tab', { name: 'Guest Pass Credentials' }))
  })
})
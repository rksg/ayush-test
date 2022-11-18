import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import ApList from '.'

describe('ApList', () => {
  const params = { tenantId: 'tenant-id' }

  it('should render list correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <ApList />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/clients' }
      })

    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(await screen.findByRole('tab', { name: 'Guest Pass Credentials' }))
  })
})
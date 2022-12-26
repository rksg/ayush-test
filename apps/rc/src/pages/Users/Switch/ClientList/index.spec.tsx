import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ClientList from '.'
describe('ClientList', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(<Provider><ClientList /></Provider>, {
      route: { params, path: '/:tenantId/users/switch/clients' }
    })
    expect(await screen.findByText('Switch')).toBeVisible()
  })
})

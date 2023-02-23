import { rest } from 'msw'

import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import ClientList from '.'
describe('ClientList', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      )
    )
  })

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

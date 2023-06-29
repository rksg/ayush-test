import { rest } from 'msw'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
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
      route: { params, path: '/:tenantId/t/users/switch/clients' }
    })
    expect(await screen.findByText('Switch')).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'tenant-id'
    }
    render(<Provider><ClientList /></Provider>, {
      route: { params, path: '/:tenantId/t/users/switch/clients' }
    })
    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Wired (0)')).toBeVisible()
  })
})

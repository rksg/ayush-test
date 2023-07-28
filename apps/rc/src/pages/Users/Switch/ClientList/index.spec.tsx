import { rest } from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import ClientList from '.'

const mockVenueData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1' },
    { id: 'mock_venue_2', name: 'Mock Venue 2' },
    { id: 'mock_venue_3', name: 'Mock Venue 3' }
  ]
}
describe('ClientList', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) =>
          res(ctx.json({
            data: [{ switchMac: '11:11:11:11:11:11', name: 'switchName' }],
            totalCount: 0
          }))
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
    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Wired (0)')).toBeVisible()
  })
})

import { rest } from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { ApNetworksTab } from '.'

jest.mock('socket.io-client')

const list = {
  totalCount: 10,
  page: 1,
  data: [
    {
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      description: '01',
      nwSubType: 'psk',
      ssid: '01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      vlan: 1
    }, {
      id: 'ad850ca8595d4f2f9e7f208664cd9398',
      name: 'network-10',
      description: '10',
      nwSubType: 'guest',
      ssid: '10',
      venues: { count: 0, names: [] },
      vlanPool: {
        name: 'test'
      }
    }
  ]
}

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  serialNumber: '302002015736'
}

describe('Networks Table', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApNetworkList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <ApNetworksTab />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/networks' }
      })

    expect(await screen.findByRole('row', { name: /network-01/ })).toBeVisible()
  })
})

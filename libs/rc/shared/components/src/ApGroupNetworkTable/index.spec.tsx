import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { render, screen, mockServer }   from '@acx-ui/test-utils'

import { mockDeepNetworkList, mockedApGroupNetworkLinks, mockTableResult, networkApGroup } from './__tests__/fixtures'

import { ApGroupNetworksTable } from './index'

describe('ApGroupNetworksTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApGroupNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockedApGroupNetworkLinks))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(networkApGroup))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json(networkApGroup))
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(mockDeepNetworkList.response))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      )
    )
  })

  it('renders without crashing', async () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'testApGroupId' }
    render(
      <Provider>
        <ApGroupNetworksTable venueId='testVenueId' apGroupId='testApGroupId' />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      })

    expect(await screen.findByText('Network Name')).toBeInTheDocument()
    expect(await screen.findByRole('columnheader', { name: /vlan/i })).toBeVisible()
  })
})


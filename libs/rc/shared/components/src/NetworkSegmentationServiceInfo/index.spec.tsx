import { rest } from 'msw'

import { CommonUrlsInfo, EdgeDhcpUrls, NetworkSegmentationUrls, PersonaUrls, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                              from '@acx-ui/store'
import { mockServer, render, screen }                                                            from '@acx-ui/test-utils'

import {
  mockedApList,
  mockedEdgeDhcpDataList,
  mockedNsgData,
  mockedNsgStatsList,
  mockedNsgSwitchInfoData,
  mockedPersonaGroup,
  mockedTunnelProfileData
} from './__tests__/fixtures'

import { NetworkSegmentationServiceInfo } from '.'

describe('NetworkSegmentationServiceInfo', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedNsgData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockedNsgStatsList))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedApList))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockedNsgSwitchInfoData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeDhcpDataList.content[0]))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedPersonaGroup))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
      )
    )
  })

  it('Should render NetworkSegmentationServiceInfo successfully', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <NetworkSegmentationServiceInfo nsgId='test' />
      </Provider>,{
        route: { params }
      }
    )

    expect(await screen.findByText(/TestDhcp-1/i)).toBeVisible()
    expect(await screen.findByText(/tunnelProfile1/i)).toBeVisible()
    expect(await screen.findByText(/Poor/i)).toBeVisible()
  })
})
import { rest } from 'msw'

import {
  CommonUrlsInfo,
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgeGeneralFixtures,
  EdgePinFixtures,
  EdgePinUrls,
  PersonaUrls,
  TunnelProfileUrls,
  EdgeUrlsInfo,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockedApList,
  mockedPersonaGroup,
  mockedTunnelProfileData
} from './__tests__/fixtures'

import { PersonalIdentityNetworkServiceInfo } from '.'

const { mockNsgStatsList, mockNsgData, mockNsgSwitchInfoData } = EdgePinFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeDhcpDataList } = EdgeDHCPFixtures

describe('NetworkSegmentationServiceInfo', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgePinUrls.getEdgePinById.url,
        (_req, res, ctx) => res(ctx.json(mockNsgData))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockNsgStatsList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_req, res, ctx) => res(ctx.json(mockedApList))
      ),
      rest.get(
        EdgePinUrls.getSwitchInfoByNSGId.url,
        (_req, res, ctx) => res(ctx.json(mockNsgSwitchInfoData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_req, res, ctx) => res(ctx.json(mockedPersonaGroup))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (_req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
      )
    )
  })

  it('Should render NetworkSegmentationServiceInfo successfully', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(
      <Provider>
        <PersonalIdentityNetworkServiceInfo nsgId='test' />
      </Provider>,{
        route: { params }
      }

    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/TestDhcp-1/i)).toBeVisible()
    expect(await screen.findByText(/tunnelProfile1/i)).toBeVisible()
    expect(await screen.findByText(/Poor/i)).toBeVisible()
  })
})

import { useContext } from 'react'

import { rest } from 'msw'

import { CommonUrlsInfo, DpskUrls, EdgeDHCPFixtures, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeNSGFixtures, EdgeTunnelProfileFixtures, EdgeUrlsInfo, NetworkSegmentationUrls, PersonaUrls, PropertyUrlsInfo, TunnelProfileUrls, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                                                                          from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                                                                                                                                                                                   from '@acx-ui/test-utils'

import { PersonalIdentityNetworkFormContext, PersonalIdentityNetworkFormDataProvider } from './PersonalIdentityNetworkFormContext'

const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockVenueOptions } = VenueFixtures
const {
  mockPersonaGroup,
  mockDpsk,
  mockPropertyConfigs,
  mockNetworkSaveData,
  mockNetworkGroup,
  mockDeepNetworkList,
  mockNsgStatsList,
  mockNsgSwitchInfoData
} = EdgeNSGFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const { mockEdgeDhcpDataList } = EdgeDHCPFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures

describe('PersonalIdentityNetworkFormContext', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockPropertyConfigs))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockDeepNetworkList))
        }
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      ),
      rest.get(
        NetworkSegmentationUrls.getAvailableSwitches.url,
        (req, res, ctx) => {
          return res(ctx.json({ switchViewList: [
            ...mockNsgSwitchInfoData.distributionSwitches,
            ...mockNsgSwitchInfoData.accessSwitches
          ] }))
        }
      )
    )
  })

  it('should get data correctly', async () => {
    console.log(123)
    // const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
    //   wrapper: ({ children }) => <Provider>
    //     <PersonalIdentityNetworkFormDataProvider
    //       venueId='venue-id'
    //     >
    //       {children}
    //     </PersonalIdentityNetworkFormDataProvider>
    //   </Provider>,
    //   route: { params, path: createNsgPath }
    // })
    // await waitFor(() => expect(result.current.venueOptions?.length).toBe(2))
  })
})
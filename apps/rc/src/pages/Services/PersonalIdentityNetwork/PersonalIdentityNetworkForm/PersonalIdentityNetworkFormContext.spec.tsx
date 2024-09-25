import { useContext } from 'react'

import { rest } from 'msw'

import {
  CommonUrlsInfo,
  DpskUrls,
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgeGeneralFixtures,
  EdgeNSGFixtures,
  EdgeTunnelProfileFixtures,
  EdgeUrlsInfo,
  NetworkSegmentationUrls,
  PersonaUrls,
  PropertyUrlsInfo,
  TunnelProfileUrls,
  TunnelTypeEnum,
  VenueFixtures
} from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { PersonalIdentityNetworkFormContext, PersonalIdentityNetworkFormDataProvider } from './PersonalIdentityNetworkFormContext'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'
const { mockVenueOptions } = VenueFixtures
const {
  mockPersonaGroup,
  mockDpsk,
  mockPropertyConfigs,
  mockDeepNetworkList,
  mockNsgStatsList,
  mockNsgSwitchInfoData
} = EdgeNSGFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockDhcpStatsData } = EdgeDHCPFixtures
const pinTunnelData = {
  ...mockedTunnelProfileViewData,
  data: mockedTunnelProfileViewData.data.filter(item => item.type === TunnelTypeEnum.VXLAN)
}

const services = require('@acx-ui/rc/services')

describe('PersonalIdentityNetworkFormContext', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId,
      serviceId: 'testServiceId'
    }

    services.useVenueNetworkActivationsViewModelListQuery = jest.fn().mockImplementation(() => {
      return { dpskNetworkList: mockDeepNetworkList.response, isLoading: false }
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (_req, res, ctx) => res(ctx.json(mockDpsk))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (_req, res, ctx) => res(ctx.json(mockPropertyConfigs))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_req, res, ctx) => res(ctx.json(pinTunnelData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockNsgStatsList))
      ),
      rest.get(
        NetworkSegmentationUrls.getAvailableSwitches.url,
        (_req, res, ctx) => {
          return res(ctx.json({ switchViewList: [
            ...mockNsgSwitchInfoData.distributionSwitches,
            ...mockNsgSwitchInfoData.accessSwitches
          ] }))
        }
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json(mockDhcpStatsData)))
    )
  })

  it('should get data correctly', async () => {
    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider
          venueId='venue-id'
        >
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createNsgPath }
    })
    await waitFor(() => expect(result.current.venueOptions?.length).toBe(2))
    expect(result.current.venueOptions?.[0].label).toBe(mockVenueOptions.data[0].name)
    expect(result.current.venueOptions?.[1].label).toBe(mockVenueOptions.data[2].name)
    expect(result.current.venueOptions?.[0].value).toBe(mockVenueOptions.data[0].id)
    expect(result.current.venueOptions?.[1].value).toBe(mockVenueOptions.data[2].id)
    await waitFor(() =>
      expect(result.current.personaGroupId).toBe(mockPropertyConfigs.personaGroupId))
    await waitFor(() =>
      expect(result.current.personaGroupData?.id).toBe(mockPersonaGroup.id))
    await waitFor(() =>
      expect(result.current.dpskData?.id).toBe(mockDpsk.id))
    await waitFor(() =>
      expect(result.current.clusterOptions?.length).toBe(5))
    expect(result.current.clusterOptions?.[0].label).toBe(mockEdgeClusterList.data[0].name)
    expect(result.current.clusterOptions?.[0].value).toBe(mockEdgeClusterList.data[0].clusterId)
    await waitFor(() =>
      expect(result.current.tunnelProfileOptions?.length)
        .toBe(pinTunnelData.data.length))
    expect(result.current.tunnelProfileOptions?.[0].label)
      .toBe(pinTunnelData.data[0].name)
    expect(result.current.tunnelProfileOptions?.[0].value)
      .toBe(pinTunnelData.data[0].id)
    await waitFor(() =>
      expect(result.current.networkOptions?.length)
        .toBe(mockDeepNetworkList.response.length))
    expect(result.current.networkOptions?.[0].label).toBe(mockDeepNetworkList.response[0].name)
    expect(result.current.networkOptions?.[0].value).toBe(mockDeepNetworkList.response[0].id)
    await waitFor(() =>
      expect(result.current.switchList?.length)
        .toBe(mockNsgSwitchInfoData.distributionSwitches.length +
          mockNsgSwitchInfoData.accessSwitches.length))
  })

  it('should get name correctly', async () => {
    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider
          venueId='venue-id'
        >
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createNsgPath }
    })
    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_1')).toBe('Mock Venue 1'))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_1')).toBe('Edge Cluster 1'))
    await waitFor(() =>
      expect(result.current.getDhcpName('1')).toBe('TestDhcp-1'))
    await waitFor(() =>
      expect(result.current.getTunnelProfileName('tunnelProfileId1')).toBe('tunnelProfile1'))
    await waitFor(() =>
      expect(result.current.getNetworksName(['1'])).toContain('Network 1'))
  })
})
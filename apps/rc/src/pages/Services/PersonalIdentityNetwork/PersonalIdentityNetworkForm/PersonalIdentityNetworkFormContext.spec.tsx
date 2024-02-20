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
  mockNetworkSaveData,
  mockNetworkGroup,
  mockDeepNetworkList,
  mockNsgStatsList,
  mockNsgSwitchInfoData
} = EdgeNSGFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const { mockEdgeDhcpDataList } = EdgeDHCPFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const pinTunnelData = {
  ...mockedTunnelProfileViewData,
  data: mockedTunnelProfileViewData.data.filter(item => item.type === TunnelTypeEnum.VXLAN)
}

describe('PersonalIdentityNetworkFormContext', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId,
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
        (req, res, ctx) => res(ctx.json(pinTunnelData))
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
      expect(result.current.edgeOptions?.length).toBe(5))
    expect(result.current.edgeOptions?.[0].label).toBe(mockEdgeList.data[0].name)
    expect(result.current.edgeOptions?.[0].value).toBe(mockEdgeList.data[0].serialNumber)
    await waitFor(() =>
      expect(result.current.dhcpProfles?.length).toBe(mockEdgeDhcpDataList.content.length))
    expect(result.current.dhcpOptions?.length).toBe(mockEdgeDhcpDataList.content.length)
    expect(result.current.dhcpOptions?.[0].label).toBe(mockEdgeDhcpDataList.content[0].serviceName)
    expect(result.current.dhcpOptions?.[0].value).toBe(mockEdgeDhcpDataList.content[0].id)
    expect(Object.keys(result.current.poolMap ?? {}).length)
      .toBe(mockEdgeDhcpDataList.content.length)
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
      expect(result.current.getEdgeName('0000000001')).toBe('Smart Edge 1'))
    await waitFor(() =>
      expect(result.current.getDhcpName('1')).toBe('TestDhcp-1'))
    await waitFor(() =>
      expect(result.current.getDhcpPoolName('1', '1')).toBe('PoolTest1'))
    await waitFor(() =>
      expect(result.current.getTunnelProfileName('tunnelProfileId1')).toBe('tunnelProfile1'))
    await waitFor(() =>
      expect(result.current.getNetworksName(['1'])).toContain('Network 1'))
  })
})
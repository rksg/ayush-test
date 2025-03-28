import { useContext } from 'react'

import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { commonApi, edgeApi, edgeSdLanApi, pinApi, serviceApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  DpskUrls,
  EdgeCompatibilityFixtures,
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgeGeneralFixtures,
  EdgePinFixtures,
  EdgePinUrls,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeStatus,
  EdgeTunnelProfileFixtures,
  EdgeUrlsInfo,
  NetworkSegmentTypeEnum,
  PersonaUrls,
  PropertyUrlsInfo,
  SwitchUrlsInfo,
  TunnelProfileUrls,
  VenueFixtures
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockSwitchFeatureSet } from '../__tests__/fixtures'

import { PersonalIdentityNetworkFormContext, PersonalIdentityNetworkFormDataProvider } from './PersonalIdentityNetworkFormContext'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'
const editPinPath = '/:tenantId/services/personalIdentityNetwork/:serviceId/edit'
const { mockVenueOptions, mockVenueOptionsForMutuallyExclusive } = VenueFixtures
const {
  mockPersonaGroup,
  mockDpsk,
  mockDpskForPinMutullyExclusive,
  mockPropertyConfigs,
  mockDeepNetworkList,
  mockPinStatsList,
  mockPinSwitchInfoData,
  mockPinListForMutullyExclusive,
  mockDPSKNetworkList
} = EdgePinFixtures
const { mockSdLanDataForPinMutuallyExclusive } = EdgeSdLanFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockDhcpStatsData } = EdgeDHCPFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures
const pinTunnelData = {
  ...mockedTunnelProfileViewData,
  data: mockedTunnelProfileViewData.data.filter(item => item.type === NetworkSegmentTypeEnum.VXLAN)
}

// make cluster[0] and cluster[1] have the same venue
const mockEdgeClusterList = cloneDeep(EdgeGeneralFixtures.mockEdgeClusterList)
mockEdgeClusterList.data[1].venueId = mockEdgeClusterList.data[0].venueId

const services = require('@acx-ui/rc/services')

describe('PersonalIdentityNetworkFormContext', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId,
      serviceId: 'testServiceId'
    }

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeSdLanApi.util.resetApiState())
    store.dispatch(pinApi.util.resetApiState())
    store.dispatch(commonApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())

    services.useVenueNetworkActivationsViewModelListQuery = jest.fn().mockImplementation(() => {
      return { dpskNetworkList: mockDeepNetworkList.response, isLoading: false }
    })

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))
      ),
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
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))
      ),
      rest.get(
        EdgePinUrls.getAvailableSwitches.url,
        (_req, res, ctx) => {
          return res(ctx.json({ switchViewList: [
            ...mockPinSwitchInfoData.distributionSwitches,
            ...mockPinSwitchInfoData.accessSwitches
          ] }))
        }
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json(mockDhcpStatsData))),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchFeatureSets.url,
        (_req, res, ctx) => res(ctx.json(mockSwitchFeatureSet))
      )
    )
  })

  describe('edit mode', () => {
    it('should get data correctly', async () => {
      const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
        wrapper: ({ children }) => <Provider>
          <PersonalIdentityNetworkFormDataProvider
            venueId='mock_venue_1'
          >
            {children}
          </PersonalIdentityNetworkFormDataProvider>
        </Provider>,
        route: { params, path: editPinPath }
      })
      await waitFor(() => expect(result.current.venueOptions?.length).toBe(1))
      expect(result.current.venueOptions?.[0].label).toBe(mockVenueOptions.data[2].name)
      await waitFor(() =>
        expect(result.current.personaGroupId).toBe(mockPropertyConfigs.personaGroupId))
      await waitFor(() =>
        expect(result.current.personaGroupData?.id).toBe(mockPersonaGroup.id))
      await waitFor(() =>
        expect(result.current.dpskData?.id).toBe(mockDpsk.id))
      await waitFor(() =>
        expect(result.current.clusterOptions?.length).toBe(1))
      expect(result.current.clusterOptions?.[0].label).toBe(mockEdgeClusterList.data[1].name)
      expect(result.current.clusterOptions?.[0].value).toBe(mockEdgeClusterList.data[1].clusterId)
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
          .toBe(mockPinSwitchInfoData.distributionSwitches.length +
          mockPinSwitchInfoData.accessSwitches.length))
      expect(result.current.requiredFw_DS).toBe('10.0.10f')
      expect(result.current.requiredFw_AS).toBe('10.0.10f')
      expect(result.current.requiredSwitchModels).toStrictEqual(['ICX7650', 'ICX7850', 'ICX7550'])
    })

    it('should get name correctly', async () => {
      const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
        wrapper: ({ children }) => <Provider>
          <PersonalIdentityNetworkFormDataProvider
            venueId='mock_venue_1'
          >
            {children}
          </PersonalIdentityNetworkFormDataProvider>
        </Provider>,
        route: { params, path: editPinPath }
      })
      await waitFor(() =>
        expect(result.current.getVenueName('mock_venue_3')).toBe('Mock Venue 3'))
      await waitFor(() =>
        expect(result.current.getClusterName('clusterId_2')).toBe('Edge Cluster 2'))
      // HA AA mode should not be an option
      expect(result.current.getClusterName('clusterId_1')).toBe('')
      await waitFor(() =>
        expect(result.current.getDhcpName('1')).toBe('TestDhcp-1'))
      await waitFor(() =>
        expect(result.current.getTunnelProfileName('tunnelProfileId1')).toBe('tunnelProfile1'))
      await waitFor(() =>
        expect(result.current.getNetworksName(['1'])).toContain('Network 1'))

      expect(result.current.getVenueName('mock_venue_1')).toBe('')
    })
  })

  it('should filter out venue already bound with existing PIN in create mode', async () => {
    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider>
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createPinPath }
    })

    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_3')).toBe('Mock Venue 3'))

    expect(result.current.getVenueName('mock_venue_1')).toBe('')
    expect(result.current.getVenueName('mock_venue_2')).toBe('')
  })

  it('should filter venue already bound with SD-LAN', async () => {
    const edgeList = cloneDeep(mockEdgeClusterList)
    edgeList.data[1].venueId = mockVenueOptionsForMutuallyExclusive.data[1].id
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockVenueOptionsForMutuallyExclusive))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinListForMutullyExclusive))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockSdLanDataForPinMutuallyExclusive }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(edgeList))
      )
    )

    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider venueId='venue-id'>
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createPinPath }
    })

    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_5')).toBe(''))
    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_4')).toBe(''))
    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_3')).toBe('Mock Venue 3'))
    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_2')).toBe(''))
    await waitFor(() =>
      expect(result.current.getVenueName('mock_venue_1')).toBe(''))
  })

  it('should filter network already bound with SD-LAN', async () => {
    services.useVenueNetworkActivationsViewModelListQuery = jest.fn().mockImplementation(() => {
      return { dpskNetworkList: mockDPSKNetworkList.response, isLoading: false }
    })

    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (_req, res, ctx) => res(ctx.json(mockDpskForPinMutullyExclusive))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockSdLanDataForPinMutuallyExclusive }))
      )
    )

    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider venueId='venue-id'>
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createPinPath }
    })

    await waitFor(() =>
      expect(result.current.getNetworksName(['network3'])).toEqual([]))
    await waitFor(() =>
      expect(result.current.getNetworksName(['network5'])).toEqual([]))

    await waitFor(() =>
      expect(result.current.getNetworksName(['network1'])).toContain('Network 1'))
    await waitFor(() =>
      expect(result.current.getNetworksName(['network2'])).toContain('Network 2'))
    await waitFor(() =>
      expect(result.current.getNetworksName(['network4'])).toContain('Network 4'))
    await waitFor(() =>
      expect(result.current.getNetworksName(['network6'])).toContain('Network 6'))
  })

  it('should filter cluster already bound with SD-LAN', async () => {
    const mockClusterList = cloneDeep(mockEdgeClusterList)
    // eslint-disable-next-line max-len
    mockClusterList.data[4].edgeList.forEach(node => (node as EdgeStatus).firmwareVersion = '2.2.0.123')

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockClusterList))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.json(mockSdLanDataForPinMutuallyExclusive))
      )
    )

    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider venueId='0000000005'>
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createPinPath }
    })

    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_1')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_2')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_3')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_4')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_5')).toBe('Edge Cluster 5'))
  })

  it('should filter cluster which firmware version is less than 2.2.0.1', async () => {
    const mockClusterList = cloneDeep(mockEdgeClusterList)

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockClusterList))
      )
    )

    const { result } = renderHook(() => useContext(PersonalIdentityNetworkFormContext), {
      wrapper: ({ children }) => <Provider>
        <PersonalIdentityNetworkFormDataProvider venueId='0000000005'>
          {children}
        </PersonalIdentityNetworkFormDataProvider>
      </Provider>,
      route: { params, path: createPinPath }
    })

    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_1')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_2')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_3')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_4')).toBe(''))
    await waitFor(() =>
      expect(result.current.getClusterName('clusterId_5')).toBe(''))
  })
})
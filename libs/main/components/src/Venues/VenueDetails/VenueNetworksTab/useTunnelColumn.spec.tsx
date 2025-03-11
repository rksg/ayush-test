/* eslint-disable max-len */
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { cloneDeep }                          from 'lodash'
import { rest }                               from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                        from '@acx-ui/feature-toggle'
import { NetworkTunnelActionModalProps, useEdgeAllPinData, useSdLanScopedVenueNetworks } from '@acx-ui/rc/components'
import {
  aggregatedVenueNetworksDataV2,
  networkApi,
  softGreApi,
  venueApi
} from '@acx-ui/rc/services'
import {
  ApCompatibility,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  EdgeMvSdLanViewData,
  EdgePinFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanTunneledWlan,
  MtuTypeEnum,
  SoftGreUrls,
  VlanPoolRbacUrls,
  WifiUrlsInfo,
  EdgePinUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  venueNetworkList,
  networkDeepList,
  venueData,
  venueNetworkApCompatibilitiesData,
  venueNetworkApGroupData,
  venuelist,
  mockSoftGreTable
} from '../../__tests__/fixtures'

import { VenueNetworksTab } from './index'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

// isMapEnabled = false && SD-LAN not enabled
const disabledFFs = [
  Features.G_MAP,
  Features.EDGES_SD_LAN_TOGGLE,
  Features.EDGES_SD_LAN_HA_TOGGLE,
  Features.WIFI_RBAC_API,
  Features.WIFI_COMPATIBILITY_BY_MODEL,
  Features.RBAC_CONFIG_TEMPLATE_TOGGLE,
  Features.EDGE_SD_LAN_MV_TOGGLE,
  Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE,
  Features.EDGE_PIN_ENHANCE_TOGGLE,
  Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE
]
jest.mocked(useIsSplitOn).mockImplementation(ff => !disabledFFs.includes(ff as Features))

type MockDialogProps = React.PropsWithChildren<{
  visible: boolean
  onOk?: () => void
  onCancel?: () => void
}>
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkApGroupDialog: ({ onOk = ()=>{}, onCancel = ()=>{}, visible }: MockDialogProps) =>
    visible && <div data-testid={'NetworkApGroupDialog'}>
      <button onClick={(e)=>{e.preventDefault();onOk()}}>Apply</button>
      <button onClick={(e)=>{e.preventDefault();onCancel()}}>Cancel</button>
    </div>,
  NetworkVenueScheduleDialog: ({ onOk = ()=>{}, onCancel = ()=>{}, visible }: MockDialogProps) =>
    visible && <div data-testid={'NetworkVenueScheduleDialog'}>
      <button onClick={(e)=>{e.preventDefault();onOk()}}>Apply</button>
      <button onClick={(e)=>{e.preventDefault();onCancel()}}>Cancel</button>
    </div>,
  useSdLanScopedVenueNetworks: jest.fn().mockReturnValue({
    sdLans: [],
    scopedNetworkIds: []
  }),
  transformVLAN: jest.fn().mockReturnValue('VLAN-1 (Default)'),
  useEdgeAllPinData: jest.fn().mockReturnValue([]),
  NetworkTunnelActionModal: jest.fn().mockImplementation((props: NetworkTunnelActionModalProps) => {
    return <div data-testid='rc-NetworkTunnelActionModal' >
      {''+props.isPinNetwork}
    </div>
  })
}))

const mockVenueNetworkData1 = aggregatedVenueNetworksDataV2(venueNetworkList, { data: venueNetworkApGroupData }, networkDeepList)

const networkIdsToIncompatible:{ [key:string]: number } = {}
venueNetworkApCompatibilitiesData.apCompatibilities.forEach((item: ApCompatibility) => {
  networkIdsToIncompatible[item.id] = item.incompatible
})
const mockVenueNetworkData2 = aggregatedVenueNetworksDataV2(venueNetworkList, { data: venueNetworkApGroupData }, networkDeepList, networkIdsToIncompatible)

const services = require('@acx-ui/rc/services')

const params = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  venueId: '3b2ffa31093f41648ed38ed122510029'
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate(),
  useHelpPageLink: () => ''
}))

describe('VenueNetworksTab - PIN enabled', () => {

  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    services.useVenueNetworkTableV2Query = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData2 }
    })

    services.useVenueNetworkListV2Query = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData1 }
    })

    services.useNewVenueNetworkTableQuery = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData2 }
    })

    act(() => {
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      store.dispatch(softGreApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenueNetworkTemplateList.url,
        (_, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (_, res, ctx) => res(ctx.json({ response: venueNetworkApGroupData }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_, res, ctx) => res(ctx.json({ data: venueNetworkApGroupData }))
      ),
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (_, res, ctx) => res(ctx.json({ venue: venueData }))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),

      // rbac API
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable))),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json({ data: [] })))
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
    mockedUsedNavigate.mockRestore()
  })

  const targetNetworkInfo = venueNetworkApGroupData[0]
  const targetNetworkId = targetNetworkInfo.networkId

  describe('Edge and multi-venue SD-LAN FF is on', () => {
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)

      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.G_MAP
        && ff !== Features.WIFI_RBAC_API
        && ff !== Features.WIFI_COMPATIBILITY_BY_MODEL
        && ff !== Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE
        && ff !== Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE
        && ff !== Features.EDGE_PIN_ENHANCE_TOGGLE)
    })

    const mockedSdLanScopeData = {
      sdLans: [{
        ...mockedMvSdLanDataList[0],
        tunneledWlans: [
          ...mockedMvSdLanDataList[0].tunneledWlans!,
          {
            networkId: targetNetworkId,
            networkName: 'test_1',
            venueId: params.venueId
          }
        ]
      }] as EdgeMvSdLanViewData[],
      scopedNetworkIds: ['network_1', 'network_4', targetNetworkId],
      scopedGuestNetworkIds: ['network_4']
    }

    it('should correctly display tunnel column when SD-LAN is running on it', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByText('Network Topology')
      await within(activatedRow).findByText(/SD-LAN/)
      const sdlanLink = within(activatedRow).getByRole('link', { name: 'Mocked_SDLAN_1' })
      expect(sdlanLink).toHaveAttribute('href', `/${params.tenantId}/t/services/edgeSdLan/mocked-sd-lan-1/detail`)
      const toggleTunnelBtn = within(activatedRow).getAllByRole('switch')[1]
      expect(toggleTunnelBtn).toBeChecked()
    })

    it('should greyout when the WLAN is the last one in SDLAN', async () => {
      const mockedData = {
        sdLans: [{
          ...mockedMvSdLanDataList[0],
          name: 'Mocked_SDLAN_last_one_test',
          tunneledWlans: [{
            networkId: targetNetworkId,
            networkName: 'test_1',
            venueId: params.venueId
          }] as EdgeSdLanTunneledWlan[],
          tunneledGuestWlans: [] as EdgeSdLanTunneledWlan[]
        }] as EdgeMvSdLanViewData[],
        scopedNetworkIds: [targetNetworkId],
        scopedGuestNetworkIds: []
      }
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      await within(activatedRow).findByText(/SD-LAN/)
      within(activatedRow).getByRole('link', { name: 'Mocked_SDLAN_last_one_test' })
      const toggleTunnelBtn = within(activatedRow).getAllByRole('switch')[1]
      expect(toggleTunnelBtn).toBeChecked()
      expect(toggleTunnelBtn).toBeDisabled()
      await userEvent.hover(toggleTunnelBtn, { pointerEventsCheck: PointerEventsCheckLevel.Never })
      await screen.findByRole('tooltip', { name: 'Cannot deactivate the last network at this venue', hidden: true })
    })

    it('should correctly display when the network is not SDLAN selected', async () => {
      const mockSdLan = cloneDeep(mockedMvSdLanDataList[0])
      mockSdLan.tunneledWlans![0].venueId = params.venueId

      const mockData = {
        sdLans: [mockSdLan] as EdgeMvSdLanViewData[],
        scopedNetworkIds: ['network_1', 'network_4'],
        scopedGuestNetworkIds: ['network_4']
      }
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      const toggleTunnelBtn = within(activatedRow).getAllByRole('switch')[1]
      expect(toggleTunnelBtn).not.toBeChecked()
    })
  })

  describe('bounded with PIN', () => {

    const mockPinStatsList = cloneDeep(EdgePinFixtures.mockPinStatsList)
    mockPinStatsList.data[0].venueId = params.venueId
    mockPinStatsList.data[0].tunneledWlans.push({ networkId: targetNetworkId })

    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.G_MAP
        && ff !== Features.WIFI_RBAC_API
        && ff !== Features.WIFI_COMPATIBILITY_BY_MODEL
        && ff !== Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE
        && ff !== Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE
        && ff !== Features.EDGE_PIN_ENHANCE_TOGGLE)
    })

    const mockedSdLanScopeData = {
      sdLans: [] as EdgeMvSdLanViewData[],
      scopedNetworkIds: [],
      scopedGuestNetworkIds: []
    }

    it('should correctly display tunnel column when PIN is running on it', async () => {
      jest.mocked(useEdgeAllPinData).mockReturnValue(mockPinStatsList.data)
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByText('Network Topology')
      await within(activatedRow).findByText(/PIN/)
      const pinLink = within(activatedRow).getByRole('link', { name: 'nsg1' })
      expect(pinLink).toHaveAttribute('href', `/${params.tenantId}/t/services/personalIdentityNetwork/1/detail`)
      const toggleTunnelBtn = within(activatedRow).getAllByRole('switch')[1]
      expect(toggleTunnelBtn).toBeDisabled()
      expect(toggleTunnelBtn).toBeChecked()
    })

    it('should correctly greyout SD-LAN tunnel column when PIN is running on it', async () => {
      const mockPinList = cloneDeep(EdgePinFixtures.mockPinStatsList)
      mockPinList.data[0].tunneledWlans.push({ networkId: targetNetworkId })

      jest.mocked(useEdgeAllPinData).mockReturnValue(mockPinList.data)
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByText('Network Topology')
      const toggleTunnelBtn = within(activatedRow).getAllByRole('switch')[1]
      expect(toggleTunnelBtn).not.toBeDisabled()
      expect(toggleTunnelBtn).not.toBeChecked()

      await userEvent.click(toggleTunnelBtn)
      await waitFor(() => expect(screen.getByTestId('rc-NetworkTunnelActionModal')).toHaveTextContent('true'))
    })
  })

  describe('SoftGreTunnel', () => {
    const tenantId = 'tenantId'
    const venueId = 'venueId-1'

    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff !== Features.G_MAP &&
        ff !== Features.WIFI_COMPATIBILITY_BY_MODEL &&
        ff !== Features.EDGES_SD_LAN_TOGGLE &&
        ff !== Features.EDGES_SD_LAN_HA_TOGGLE &&
        ff !== Features.EDGE_SD_LAN_MV_TOGGLE &&
        ff !== Features.EDGE_PIN_ENHANCE_TOGGLE &&
        ff !== Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
    })

    it('should correctly display tunnel column when SoftGre is running on it', async () => {
      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params: { tenantId, venueId },
          path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByText('Network Topology')
      await within(activatedRow).findByText(/SoftGRE/)
      const softGreLink = within(activatedRow).getByRole('link', { name: 'softGreProfileName1' })
      expect(softGreLink).toHaveAttribute('href', `/${tenantId}/t/policies/softGre/0d89c0f5596c4689900fb7f5f53a0859/detail`)
    })

    it('should correctly display local breakout when the network is not SoftGre selected', async () => {
      mockServer.use(
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => res(ctx.json({ totalCount: 1,page: 1, data: [{
            id: '0d89c0f5596c4689900fb7f5f53a0859',
            name: 'softGreProfileName1',
            mtuType: MtuTypeEnum.MANUAL,
            mtuSize: 1450,
            disassociateClientEnabled: false,
            primaryGatewayAddress: '128.0.0.1',
            secondaryGatewayAddress: '128.0.0.0',
            keepAliveInterval: 100,
            keepAliveRetryTimes: 8,
            activations: [
              {
                venueId: 'venueId-1',
                wifiNetworkIds: ['network_1', 'network_2', 'network_3']
              }
            ]
          }] }))
        )
      )
      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params: { tenantId, venueId },
          path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByText('Network Topology')
      const toggleTunnelBtn = within(activatedRow).getAllByRole('switch')[1]
      expect(toggleTunnelBtn).not.toBeDisabled()
      expect(toggleTunnelBtn).not.toBeChecked()
    })
  })
})

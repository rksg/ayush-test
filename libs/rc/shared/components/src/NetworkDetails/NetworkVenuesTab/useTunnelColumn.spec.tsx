/* eslint-disable max-len */
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { cloneDeep }                          from 'lodash'

import { Table }                  from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  pinApi } from '@acx-ui/rc/services'
import {
  EdgeSdLanFixtures,
  Venue,
  NetworkTypeEnum,
  EdgePinFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { useEdgePinScopedNetworkVenueMap } from '../../NetworkTunnelActionModal'
import { useIsEdgeFeatureReady }           from '../../useEdgeActions'

import { list }            from './__tests__/fixtures'
import { useTunnelColumn } from './useTunnelColumn'

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

jest.mock('../../NetworkTunnelActionModal', () => ({
  ...jest.requireActual('../../NetworkTunnelActionModal'),
  useEdgePinScopedNetworkVenueMap: jest.fn().mockReturnValue({})
}))
jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => ({ isTemplate: false })
}))

const targetNetwork = mockedMvSdLanDataList[0].tunneledWlans![0]

const params = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  networkId: targetNetwork.networkId
}
const venuesList = cloneDeep(list)
venuesList.data[0].id = targetNetwork.venueId
venuesList.data.forEach(v => v.activated = { isActivated: true })

const mockedSdLanScopeData = {
  sdLansVenueMap: {
    [targetNetwork.venueId]: [mockedMvSdLanDataList[0]]
  },
  networkVenueIds: [targetNetwork.venueId],
  guestNetworkVenueIds: []
}

describe('VenueNetworksTab - PIN enabled', () => {

  beforeEach(() => {
    act(() => {
      store.dispatch(pinApi.util.resetApiState())
    })

    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_PIN_HA_TOGGLE)
  })

  describe('Edge and multi-venue SD-LAN FF is on', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_SD_LAN_MV_TOGGLE
        || ff === Features.EDGE_PIN_HA_TOGGLE)
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.G_MAP
        && ff !== Features.WIFI_RBAC_API
        && ff !== Features.WIFI_COMPATIBILITY_BY_MODEL
        && ff !== Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE
        && ff !== Features.EDGE_PIN_ENHANCE_TOGGLE
        && ff !== Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
    })

    it('should correctly display tunnel column when SD-LAN is running on it', async () => {
      const { result } = renderHook(() => useTunnelColumn({
        network: {
          id: mockedMvSdLanDataList[0].tunneledWlans![0].networkId,
          type: NetworkTypeEnum.PSK
        },
        sdLanScopedNetworkVenues: mockedSdLanScopeData,
        setTunnelModalState: jest.fn()
      }), { wrapper: Provider })

      render(<Provider>
        <Table
          rowKey='id'
          columns={[{
            key: 'name',
            title: 'Venue',
            dataIndex: 'name'
          }].concat(result.current)}
          dataSource={venuesList.data as unknown as Venue[]}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/:networkId' }
      })

      const activatedRow = screen.getByRole('row', { name: new RegExp(venuesList.data[0].name) })
      screen.getByText('Network Topology')
      await within(activatedRow).findByText(/SD-LAN/)
      const sdlanLink = within(activatedRow).getByRole('link', { name: 'Mocked_SDLAN_1' })
      expect(sdlanLink).toHaveAttribute('href', `/${params.tenantId}/t/services/edgeSdLan/mocked-sd-lan-1/detail`)
      const toggleTunnelBtn = within(activatedRow).getByRole('switch')
      expect(toggleTunnelBtn).toBeChecked()

      // toggle button should not checked when the network is not SDLAN selected
      const row2 = await screen.findByRole('row', { name: new RegExp(venuesList.data[1].name) })
      const row2ToggleTunnelBtn = within(row2).getByRole('switch')
      expect(row2ToggleTunnelBtn).not.toBeChecked()
    })

    it('should greyout when the WLAN is the last one in SDLAN', async () => {
      const mockSingleWlan = cloneDeep(mockedMvSdLanDataList[0])
      mockSingleWlan.name = 'Mocked_SDLAN_last_one_test'
      // make it as the last one wlan
      mockSingleWlan.tunneledWlans = mockSingleWlan.tunneledWlans!.slice(0, 1)

      const mockedData = {
        sdLansVenueMap: {
          [targetNetwork.venueId]: [mockSingleWlan]
        },
        networkVenueIds: [targetNetwork.venueId],
        guestNetworkVenueIds: []
      }

      const { result } = renderHook(() => useTunnelColumn({
        network: {
          id: mockSingleWlan.tunneledWlans![0].networkId,
          type: NetworkTypeEnum.PSK
        },
        sdLanScopedNetworkVenues: mockedData,
        setTunnelModalState: jest.fn()
      }), { wrapper: Provider })

      render(<Provider>
        <Table
          rowKey='id'
          columns={[{
            key: 'name',
            title: 'Venue',
            dataIndex: 'name'
          }].concat(result.current)}
          dataSource={venuesList.data as unknown as Venue[]}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/:networkId' }
      })

      const activatedRow = await screen.findByRole('row', { name: new RegExp(venuesList.data[0].name) })
      await within(activatedRow).findByText(/SD-LAN/)
      within(activatedRow).getByRole('link', { name: 'Mocked_SDLAN_last_one_test' })
      const toggleTunnelBtn = within(activatedRow).getByRole('switch')
      expect(toggleTunnelBtn).toBeChecked()
      expect(toggleTunnelBtn).toBeDisabled()
      await userEvent.hover(toggleTunnelBtn, { pointerEventsCheck: PointerEventsCheckLevel.Never })
      await screen.findByRole('tooltip', { name: 'Cannot deactivate the last network at this venue', hidden: true })
    })


    it('should not render when networkId is not given', async () => {
      const mockSingleWlan = cloneDeep(mockedMvSdLanDataList[0])
      mockSingleWlan.name = 'Mocked_SDLAN_last_one_test'
      // make it as the last one wlan
      mockSingleWlan.tunneledWlans = mockSingleWlan.tunneledWlans!.slice(0, 1)

      const mockedData = {
        sdLansVenueMap: {
          [targetNetwork.venueId]: [mockSingleWlan]
        },
        networkVenueIds: [targetNetwork.venueId],
        guestNetworkVenueIds: []
      }

      const { result } = renderHook(() => useTunnelColumn({
        // when the network id is not given
        network: {},
        sdLanScopedNetworkVenues: mockedData,
        setTunnelModalState: jest.fn()
      }), { wrapper: Provider })

      render(<Provider>
        <Table
          rowKey='id'
          columns={[{
            key: 'name',
            title: 'Venue',
            dataIndex: 'name'
          }].concat(result.current)}
          dataSource={venuesList.data as unknown as Venue[]}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/:networkId' }
      })

      const activatedRow = screen.getByRole('row', { name: new RegExp(venuesList.data[0].name) })
      expect(activatedRow.textContent).toBe(venuesList.data[0].name)
      expect(within(activatedRow).queryByRole('switch')).toBeNull()
    })
  })

  describe('bounded with PIN', () => {
    const mockPinStatsList = cloneDeep(EdgePinFixtures.mockPinStatsList)
    mockPinStatsList.data[0].venueId = targetNetwork.venueId
    mockPinStatsList.data[0].tunneledWlans.push({ networkId: targetNetwork.networkId })

    const mockedNoSdLanScopeData = {
      sdLansVenueMap: {},
      networkVenueIds: [],
      guestNetworkVenueIds: []
    }

    it('should correctly display tunnel column when PIN is running on it', async () => {
      jest.mocked(useEdgePinScopedNetworkVenueMap).mockImplementation(() => ({
        [targetNetwork.venueId]: [mockPinStatsList.data[0]]
      }))

      const { result } = renderHook(() => useTunnelColumn({
        network: {
          id: targetNetwork.networkId,
          type: NetworkTypeEnum.DPSK
        },
        sdLanScopedNetworkVenues: mockedNoSdLanScopeData,
        setTunnelModalState: jest.fn()
      }), { wrapper: Provider })

      render(<Provider>
        <Table
          rowKey='id'
          columns={[{
            key: 'name',
            title: 'Venue',
            dataIndex: 'name'
          }].concat(result.current)}
          dataSource={venuesList.data as unknown as Venue[]}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/:networkId' }
      })

      const activatedRow = screen.getByRole('row', { name: new RegExp(venuesList.data[0].name) })
      await within(activatedRow).findByText(/PIN/)
      const pinLink = within(activatedRow).getByRole('link', { name: 'nsg1' })
      expect(pinLink).toHaveAttribute('href', `/${params.tenantId}/t/services/personalIdentityNetwork/1/detail`)
      const toggleTunnelBtn = within(activatedRow).getByRole('switch')
      expect(toggleTunnelBtn).toBeDisabled()
      expect(toggleTunnelBtn).toBeChecked()
    })

    it('should correctly greyout SD-LAN tunnel column when PIN is running on it', async () => {
      const mockPinList = cloneDeep(EdgePinFixtures.mockPinStatsList)
      mockPinList.data[0].venueId = 'another_mock_venue'
      mockPinList.data[0].tunneledWlans.push({ networkId: targetNetwork.networkId })

      jest.mocked(useEdgePinScopedNetworkVenueMap).mockImplementation(() => ({
        [mockPinList.data[0].venueId]: [mockPinStatsList.data[0]]
      }))

      const mockSetModalStateFn = jest.fn()
      const { result } = renderHook(() => useTunnelColumn({
        network: {
          id: targetNetwork.networkId,
          type: NetworkTypeEnum.DPSK
        },
        sdLanScopedNetworkVenues: mockedNoSdLanScopeData,
        setTunnelModalState: mockSetModalStateFn
      }), { wrapper: Provider })

      render(<Provider>
        <Table
          rowKey='id'
          columns={[{
            key: 'name',
            title: 'Venue',
            dataIndex: 'name'
          }].concat(result.current)}
          dataSource={venuesList.data as unknown as Venue[]}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/:networkId' }
      })

      const activatedRow = await screen.findByRole('row', { name: new RegExp(venuesList.data[0].name) })
      const toggleTunnelBtn = within(activatedRow).getByRole('switch')
      expect(toggleTunnelBtn).not.toBeDisabled()
      expect(toggleTunnelBtn).not.toBeChecked()
      await userEvent.click(toggleTunnelBtn)
      await waitFor(() => expect(mockSetModalStateFn).toBeCalledWith({
        visible: true,
        network: {
          id: targetNetwork.networkId,
          type: NetworkTypeEnum.DPSK,
          venueId: venuesList.data[0].id,
          venueName: venuesList.data[0].name
        },
        isPinNetwork: true,
        cachedSoftGre: []
      }))
    })
  })

  describe('when FFs are off', () => {
    it('should return empty array', async () => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
      jest.mocked(useIsSplitOn).mockReturnValue(false)

      const { result } = renderHook(() => useTunnelColumn({
        network: {
          id: 'mock-networkId',
          type: NetworkTypeEnum.PSK
        },
        sdLanScopedNetworkVenues: {
          sdLansVenueMap: {},
          networkVenueIds: [],
          guestNetworkVenueIds: []
        },
        setTunnelModalState: jest.fn()
      }), { wrapper: Provider })

      expect(result.current.length).toBe(0)
    })
  })
})

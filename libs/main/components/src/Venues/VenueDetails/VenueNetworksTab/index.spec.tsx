/* eslint-disable max-len */
import '@testing-library/jest-dom'
import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features, useIsSplitOn }      from '@acx-ui/feature-toggle'
import { useSdLanScopedVenueNetworks } from '@acx-ui/rc/components'
import {
  aggregatedVenueNetworksDataV2,
  edgeSdLanApi,
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
  EdgeSdLanFixtures,
  EdgeSdLanTunneledWlan,
  EdgeSdLanUrls,
  MtuTypeEnum,
  SoftGreUrls,
  VlanPoolRbacUrls,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
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

const { mockedSdLanDataListP2, mockedMvSdLanDataList } = EdgeSdLanFixtures

// isMapEnabled = false && SD-LAN not enabled
const disabledFFs = [
  Features.G_MAP,
  Features.EDGES_SD_LAN_TOGGLE,
  Features.EDGES_SD_LAN_HA_TOGGLE,
  Features.WIFI_RBAC_API,
  Features.RBAC_CONFIG_TEMPLATE_TOGGLE,
  Features.WIFI_COMPATIBILITY_BY_MODEL,
  Features.EDGE_SD_LAN_MV_TOGGLE,
  Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE,
  Features.EDGE_PIN_HA_TOGGLE,
  Features.EDGE_PIN_ENHANCE_TOGGLE
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
  transformVLAN: jest.fn().mockReturnValue('VLAN-1 (Default)')
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

describe('VenueNetworksTab', () => {

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
      store.dispatch(edgeSdLanApi.util.resetApiState())
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
        (_, res, ctx) => res(ctx.json(mockSoftGreTable)))
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
    mockedUsedNavigate.mockRestore()
  })

  it('should render correctly', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    //screen.debug(undefined, 1000000)
    const row = await screen.findByRole('row', { name: /test_1/i })
    expect(row).toHaveTextContent('Passphrase (PSK/SAE)')
    expect(row).toHaveTextContent('VLAN-1 (Default)')
  })

  it('should render correctly with isTemplate is true', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    const row = await screen.findByRole('row', { name: /test_1/i })
    expect(row).toHaveTextContent('Passphrase (PSK/SAE)')
    expect(row).toHaveTextContent('VLAN-1 (Default)')

    await userEvent.click(await screen.findByRole('button', { name: 'Add Network' }))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('should clicks add network correctly', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    expect(await screen.findByText('Add Network')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Network' }))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('activate Network', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
    const row = await screen.findByRole('row', { name: /test_2/i })

    const requestSpy = jest.fn()
    const newApGroupData = JSON.parse(JSON.stringify(venueNetworkApGroupData))
    newApGroupData[1].apGroups[0].id = 'test2'

    const newMockVenueNetworkData = aggregatedVenueNetworksDataV2(venueNetworkList, { data: newApGroupData }, networkDeepList)

    services.useVenueNetworkListV2Query = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    services.useVenueNetworkTableV2Query = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    mockServer.use(
      rest.post(
        WifiUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '123' }))
        }
      )
    )

    const toogleButton = await within(row).findByRole('switch', { checked: false })
    await userEvent.click(toogleButton)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    //await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  })

  it('deactivate Network', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
    const row = await screen.findByRole('row', { name: /test_1/i })

    const requestSpy = jest.fn()
    const newApGroupData = JSON.parse(JSON.stringify(venueNetworkApGroupData))
    newApGroupData[0].apGroups[0].id = ''

    const newMockVenueNetworkData = aggregatedVenueNetworksDataV2(venueNetworkList, { data: newApGroupData }, networkDeepList)

    services.useVenueNetworkListV2Query = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    services.useVenueNetworkTableV2Query = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    mockServer.use(
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '456' }))
        }
      )
    )

    const toogleButton = await within(row).findByRole('switch', { checked: true })
    await userEvent.click(toogleButton)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    //await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

  it('click VLAN, APs, Radios, Scheduling', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    const row = await screen.findByRole('row', { name: /test_1/i })

    await userEvent.click(within(row).getByText('VLAN-1 (Default)'))
    await userEvent.click(within(row).getByText('2.4 GHz, 5 GHz'))
    await userEvent.click(within(row).getByText('All APs'))
    await userEvent.click(within(row).getByText('24/7'))

    const dialog = await screen.findByTestId('NetworkApGroupDialog')
    const dialog2 = await screen.findByTestId('NetworkVenueScheduleDialog')

    expect(dialog).toBeVisible()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => expect(dialog2).not.toBeVisible())
  })

  it('should render ap compatibilies correctly', async () => {

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    const row = await screen.findByRole('row', { name: /test_1/i })

    const icon = await within(row).findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })

  it('activate Network - rbac API', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API)

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
    const row = await screen.findByRole('row', { name: /test_2/i })

    const requestSpy = jest.fn()
    const newApGroupData = JSON.parse(JSON.stringify(venueNetworkApGroupData))
    newApGroupData[1].apGroups[0].id = 'test2'

    const newMockVenueNetworkData = aggregatedVenueNetworksDataV2(venueNetworkList, { data: newApGroupData }, networkDeepList)

    services.useNewVenueNetworkTableQuery = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    mockServer.use(
      rest.put(
        WifiRbacUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '123' }))
        }
      )
    )

    const toogleButton = await within(row).findByRole('switch', { checked: false })
    await userEvent.click(toogleButton)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    //await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  })

  it('deactivate Network - rbac API', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API)

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
    const row = await screen.findByRole('row', { name: /test_1/i })

    const requestSpy = jest.fn()
    const newApGroupData = JSON.parse(JSON.stringify(venueNetworkApGroupData))
    newApGroupData[0].apGroups[0].id = ''

    const newMockVenueNetworkData = aggregatedVenueNetworksDataV2(venueNetworkList, { data: newApGroupData }, networkDeepList)

    services.useNewVenueNetworkTableQuery = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    mockServer.use(
      rest.delete(
        WifiRbacUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '456' }))
        }
      )
    )

    const toogleButton = await within(row).findByRole('switch', { checked: true })
    await userEvent.click(toogleButton)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    //await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

  describe('Edge and SD-LAN P2 FF is on', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_SD_LAN_HA_TOGGLE || ff === Features.EDGES_TOGGLE)
    })
    const mockedSdLanScopeData = {
      sdLans: [{
        ...mockedSdLanDataListP2[0],
        networkIds: ['d556bb683e4248b7a911fdb40c307aa5']
      }],
      scopedNetworkIds: ['d556bb683e4248b7a911fdb40c307aa5'],
      scopedGuestNetworkIds: []
    }

    it('confirm deactivate when SD-LAN is scoped in the selected network', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      await userEvent.click(await within(activatedRow).findByRole('switch'))
      const popup = await screen.findByRole('dialog')
      await screen.findByText(/This network is running the SD-LAN service on this venue/i)
      await userEvent.click( await within(popup).findByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(popup).not.toBeVisible())
    })

    it('should correctly display tunnel column when SD-LAN is running on it', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      expect(activatedRow).toHaveTextContent('Tunneled (SE_Cluster 0)')
    })

    it('should correctly display tunnel column when SD-LAN is not running on it', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue({
        sdLans: [],
        scopedNetworkIds: [],
        scopedGuestNetworkIds: []
      })

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      expect(activatedRow).toHaveTextContent('Local Breakout')
    })
  })

  describe('Edge and multi-venue SD-LAN FF is on', () => {
    const targetNetworkInfo = venueNetworkApGroupData[0]
    const targetNetworkId = targetNetworkInfo.networkId

    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_SD_LAN_MV_TOGGLE || ff === Features.EDGES_TOGGLE)
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

    it('confirm deactivate when SD-LAN is scoped in the selected network', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      await userEvent.click(await within(activatedRow).findByRole('switch'))
      const popup = await screen.findByRole('dialog')
      await screen.findByText(/This network is running the SD-LAN service on this venue/i)
      await userEvent.click( await within(popup).findByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(popup).not.toBeVisible())
    })

    it('should correctly display tunnel column when SD-LAN is running on it', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue(mockedSdLanScopeData)

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            return res(ctx.json({ data: mockedSdLanScopeData.sdLans }))
          }
        )
      )

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      const tunnelBtn = await within(activatedRow).findByRole('button', { name: 'Tunneled (SE_Cluster 0)' })
      await userEvent.click(tunnelBtn)
      const tunnelNetworkModal = await screen.findByRole('dialog')
      const radioOpt_sdlan = await within(tunnelNetworkModal).findByRole('radio', { name: /SD-LAN Tunneling/ })
      await within(tunnelNetworkModal).findByText('Mocked_SDLAN_1')
      await waitFor(() => expect(radioOpt_sdlan).toBeChecked())
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

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            return res(ctx.json({ data: mockedData.sdLans }))
          }
        )
      )

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      const tunnelBtn = await within(activatedRow).findByRole('button', { name: 'Tunneled (SE_Cluster 0)' })
      await userEvent.click(tunnelBtn)
      const tunnelNetworkModal = await screen.findByRole('dialog')
      const radioOpt_sdlan = await within(tunnelNetworkModal).findByRole('radio', { name: /SD-LAN Tunneling/ })
      await within(tunnelNetworkModal).findByText('Mocked_SDLAN_last_one_test')
      await waitFor(() => expect(radioOpt_sdlan).toBeChecked())
      expect(radioOpt_sdlan).toBeDisabled()
      const radioOpt_none = within(tunnelNetworkModal).getByRole('radio', { name: /Local Breakout/ })
      expect(radioOpt_none).toBeDisabled()
    })

    it('should correctly display local breakout when the network is not SDLAN selected', async () => {
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
      screen.getByRole('columnheader', { name: 'Tunnel' })
      await within(activatedRow).findByRole('button', { name: 'Local Breakout' })
    })

    it('should display local breakout when SD-LAN is not running on it', async () => {
      jest.mocked(useSdLanScopedVenueNetworks).mockReturnValue({
        sdLans: [],
        scopedNetworkIds: [],
        scopedGuestNetworkIds: []
      })

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      await within(activatedRow).findByRole('button', { name: 'Local Breakout' })
    })
  })

  describe('SoftGreTunnel', () => {
    const tenantId = 'tenantId'
    const venueId = 'venueId-1'

    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
    })

    it('should correctly display tunnel column when SoftGre is running on it', async () => {
      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params: { tenantId, venueId },
          path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      const tunnelBtn = await within(activatedRow).findByRole('button', { name: 'Tunneled (softGreProfileName1)' })
      await userEvent.click(tunnelBtn)
      const tunnelNetworkModal = await screen.findByRole('dialog')
      const softGreRadio = await within(tunnelNetworkModal).findByRole('radio', { name: 'SoftGRE Tunneling' })
      // await within(tunnelNetworkModal).findByText('softGreProfileName1')
      await waitFor(() => expect(softGreRadio).toBeChecked())
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
      screen.getByRole('columnheader', { name: 'Tunnel' })
      const tunnelBtn = await within(activatedRow).findByRole('button', { name: 'Local Breakout' })
      await userEvent.click(tunnelBtn)
      const tunnelNetworkModal = await screen.findByRole('dialog')
      const localRadio = await within(tunnelNetworkModal).findByRole('radio', { name: 'Local Breakout' })
      await waitFor(() => expect(localRadio).toBeChecked())
      const softGreRadio = await within(tunnelNetworkModal).findByRole('radio', { name: 'SoftGRE Tunneling' })
      await waitFor(() => expect(softGreRadio).not.toBeChecked())
    })
  })
})

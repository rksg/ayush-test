/* eslint-disable max-len */
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useSdLanScopedVenueNetworks }              from '@acx-ui/rc/components'
import {
  aggregatedVenueNetworksData,
  aggregatedVenueNetworksDataV2,
  networkApi,
  venueApi
} from '@acx-ui/rc/services'
import { ApCompatibility, CommonUrlsInfo, ConfigTemplateUrlsInfo, EdgeSdLanFixtures, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                          from '@acx-ui/store'
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
  venueNetworkApGroup,
  venueData,
  venueNetworkApCompatibilitiesData,
  venueNetworkApGroupData
} from '../../__tests__/fixtures'

import { VenueNetworksTab } from './index'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures

// isMapEnabled = false && SD-LAN not enabled
jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.G_MAP
  && ff !== Features.EDGES_SD_LAN_HA_TOGGLE
  && ff !== Features.EDGES_SD_LAN_TOGGLE)

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
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('VenueNetworksTab', () => {

  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    services.useVenueNetworkTableQuery = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData2 }
    })

    services.useVenueNetworkListQuery = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData1 }
    })

    services.useVenueNetworkTableV2Query = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData2 }
    })

    services.useVenueNetworkListV2Query = jest.fn().mockImplementation(() => {
      return { data: mockVenueNetworkData1 }
    })

    act(() => {
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenueNetworkTemplateList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: venueNetworkApGroupData }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: venueNetworkApGroupData }))
      ),
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json({ venue: venueData }))
      )
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
    const newApGroup = JSON.parse(JSON.stringify(venueNetworkApGroupData))
    newApGroup[1].apGroups[0].id = 'test2'

    const newMockVenueNetworkData = aggregatedVenueNetworksDataV2(venueNetworkList, { data: newApGroup }, networkDeepList)

    services.useVenueNetworkListQuery = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    services.useVenueNetworkTableQuery = jest.fn().mockImplementation(() => {
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
    const newApGroup = JSON.parse(JSON.stringify(venueNetworkApGroup))
    const newApGroupData = newApGroup.response
    newApGroupData[0].apGroups[0].id = ''

    const newMockVenueNetworkData = aggregatedVenueNetworksData(venueNetworkList, newApGroup, networkDeepList)

    services.useVenueNetworkListQuery = jest.fn().mockImplementation(() => {
      return { data: newMockVenueNetworkData }
    })

    services.useVenueNetworkTableQuery = jest.fn().mockImplementation(() => {
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    const row = await screen.findByRole('row', { name: /test_1/i })

    const icon = await within(row).findByTestId('InformationSolid')
    expect(icon).toBeVisible()
  })

  describe('Edge and SD-LAN FF is on', () => {
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.G_MAP)
    })
    const mockedSdLanScopeData = {
      sdLans: [{
        ...mockedSdLanDataListP2[0],
        networkIds: ['d556bb683e4248b7a911fdb40c307aa5']
      }],
      scopedNetworkIds: ['d556bb683e4248b7a911fdb40c307aa5']
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
        scopedNetworkIds: []
      })

      render(<Provider><VenueNetworksTab /></Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
      })

      const activatedRow = await screen.findByRole('row', { name: /test_1/i })
      screen.getByRole('columnheader', { name: 'Tunnel' })
      expect(activatedRow).toHaveTextContent('Local breakout')
    })
  })
})

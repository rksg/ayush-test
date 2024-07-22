/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import { networkApi, policyApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  WifiNetworkFixtures,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  findTBody,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import {
  network,
  list,
  params,
  networkVenue_allAps,
  networkVenue_apgroup,
  networkVenueApCompatibilities,
  mockNetworkSaveData,
  vlanPoolList
} from './__tests__/fixtures'

import { NetworkVenuesTab } from './index'

const { mockedRbacWifiNetworkList } = WifiNetworkFixtures

// isMapEnabled = false && SD-LAN not enabled
const disabledFFs = [
  Features.G_MAP,
  Features.EDGES_SD_LAN_TOGGLE,
  Features.EDGES_SD_LAN_HA_TOGGLE,
  Features.RBAC_SERVICE_POLICY_TOGGLE,
  Features.WIFI_RBAC_API,
  Features.SWITCH_RBAC_API
]
type MockDialogProps = React.PropsWithChildren<{
  visible: boolean
  onOk?: () => void
  onCancel?: () => void
}>
jest.mock('../../NetworkApGroupDialog', () => ({
  ...jest.requireActual('../../NetworkApGroupDialog'),
  NetworkApGroupDialog: ({ onOk = ()=>{}, onCancel = ()=>{}, visible }: MockDialogProps) =>
    visible && <div data-testid={'NetworkApGroupDialog'}>
      <button onClick={(e)=>{e.preventDefault();onOk()}}>Apply</button>
      <button onClick={(e)=>{e.preventDefault();onCancel()}}>Cancel</button>
    </div>
}))
jest.mock('../../NetworkVenueScheduleDialog', () => ({
  ...jest.requireActual('../../NetworkVenueScheduleDialog'),
  NetworkVenueScheduleDialog: ({ onOk = ()=>{}, onCancel = ()=>{}, visible }: MockDialogProps) =>
    visible && <div data-testid={'NetworkVenueScheduleDialog'}>
      <button onClick={(e)=>{e.preventDefault();onOk()}}>Apply</button>
      <button onClick={(e)=>{e.preventDefault();onCancel()}}>Cancel</button>
    </div>
}))
jest.mock('../../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../../EdgeSdLan/useEdgeSdLanActions'),
  useSdLanScopedNetworkVenues: jest.fn().mockReturnValue({
    sdLansVenueMap: {},
    networkVenueIds: [],
    guestNetworkVenueIds: []
  })
}))

const mockedApplyFn = jest.fn()
const mockedGetApCompatibilitiesNetwork = jest.fn()
const mockedNetworkActivation = jest.fn()
const mockedDeleteNetworkVenues = jest.fn()

const newApGroup2 = {
  ...networkVenue_apgroup,
  venueId: '02e2ddbc88e1428987666d31edbc3d9a',
  allApGroupsRadioTypes: ['2.4-GHz', '5-GHz', '6-GHz'],
  isAllApGroups: false,
  scheduler: {
    type: 'ALWAYS_ON'
  },
  apGroups: [{ ...networkVenue_apgroup.apGroups[0], id: '6cb1e831973a4d60924ac59f1bda073c' }]
}

const newVenues = [
  ...network.venues,
  newApGroup2
]

describe('NetworkVenuesTab', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => !disabledFFs.includes(ff as Features))
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    mockedApplyFn.mockClear()
    mockedGetApCompatibilitiesNetwork.mockClear()
    mockedNetworkActivation.mockClear()
    mockedDeleteNetworkVenues.mockClear()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (_, res, ctx) => res(ctx.json({ response: [networkVenue_allAps, networkVenue_apgroup] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_allAps, networkVenue_apgroup] }))
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(network))
      ),
      rest.post(
        WifiUrlsInfo.addNetworkVenues.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVenueCityList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkVenue.url.split('?')[0],
        (_, res, ctx) => {
          mockedApplyFn()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (_, res, ctx) => {
          mockedGetApCompatibilitiesNetwork()
          return res(ctx.json(networkVenueApCompatibilities))
        }
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: vlanPoolList }))
      )
    )
  })

  it('activate Network', async () => {
    mockServer.use(
      rest.post(
        WifiUrlsInfo.addNetworkVenue.url,
        (_, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitFor(() => expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument())
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(2))

    const table = await screen.findByRole('table')
    let rows = await within(table).findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const toogleButton = await within(table).findByRole('switch', { checked: false })
    await userEvent.click(toogleButton)

    // refetch
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.post(
        WifiUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_allAps, newApGroup2] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_allAps, newApGroup2] }))
      )
    )

    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(3))
    await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))

    const row2 = await within(table).findByRole('row', { name: /My-Venue/i })
    const icon = await within(row2).findByTestId('InformationSolid')
    expect(icon).toBeVisible()

    expect(row2).toHaveTextContent(/VLAN Pool/i)
    expect(row2).toHaveTextContent('VLAN Pool: pool1 (Custom)')
    expect(row2).toHaveTextContent('Unassigned APs')
    expect(row2).toHaveTextContent('24/7')
    expect(row2).not.toHaveTextContent('All')
  })

  it('deactivate Network', async () => {
    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_apgroup] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_apgroup] }))
      )
    )

    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toHaveBeenCalled())

    const toogleButton = await screen.findByRole('switch', { checked: true })
    await userEvent.click(toogleButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

  it('Table action bar activate Network', async () => {
    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitFor(() => expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument())
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(2))

    await userEvent.click(await screen.findByRole('row', { name: /My-Venue/i }))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    await userEvent.click(activateButton)

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => {
          mockedNetworkActivation()
          return res(ctx.json(mockNetworkSaveData))
        }
      ),
      rest.post(
        WifiUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )

    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(3))
    expect(mockedNetworkActivation).toHaveBeenCalled()

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  })

  it.skip('Table action bar activate Network and show modal', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNVenuesList.url,
        (req, res, ctx) => res(ctx.json({ ...list,
          data: [
            list.data[0],
            { ...list.data[1], allApDisabled: true }
          ]
        }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => res(ctx.json(networkVenueApCompatibilities))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )

    )

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const activateButton = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)
    await screen.findByRole('dialog')
    const OKButton = await screen.findByText('OK')
    await screen.findByText('Your Attention is Required')
    fireEvent.click(OKButton)
  })

  it('Table action bar deactivate Network', async () => {
    mockServer.use(
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenues.url,
        (_, res, ctx) => {
          mockedDeleteNetworkVenues()
          return res(ctx.json({ requestId: '456' }))
        }
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitFor(() => expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument())
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(2))
    await userEvent.click(await screen.findByRole('row', { name: /network-venue-1/i }))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    await userEvent.click(deactivateButton)

    // refetch
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: [] }))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenues.url,
        (req, res, ctx) => {
          mockedDeleteNetworkVenues()
          return res(ctx.json({ requestId: '456' }))
        }
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => {
          mockedGetApCompatibilitiesNetwork()
          return res(ctx.json(networkVenueApCompatibilities))
        }
      ),
      rest.put(
        WifiUrlsInfo.updateNetworkDeep.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => {
          mockedNetworkActivation()
          return res(ctx.json(mockNetworkSaveData))
        }
      )
    )

    await waitFor(() => expect(mockedDeleteNetworkVenues).toBeCalledTimes(1))
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(3))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
    expect(await screen.findByText('No venues activating this network. Use the ON/OFF switches in the list to select the activating venues')).toBeVisible()
  })

})

describe('NetworkVenues table with APGroup/Scheduling dialog', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => !disabledFFs.includes(ff as Features))

    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockedGetApCompatibilitiesNetwork.mockClear()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_allAps, networkVenue_apgroup] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_allAps, networkVenue_apgroup] }))
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.post(
        CommonUrlsInfo.getVenueCityList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => {
          mockedGetApCompatibilitiesNetwork()
          return res(ctx.json(networkVenueApCompatibilities))
        }
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: vlanPoolList }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => {
          return res(ctx.json(mockNetworkSaveData))
        }
      )
    )
  })

  it('has custom scheduling', async () => {

    const newAPGroups = [{
      radio: 'Both',
      radioTypes: ['5-GHz','2.4-GHz'],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      id: '6cb1e831973a4d60924ac59f1bda073c',
      apGroupName: 'APs not assigned to any group',
      vlanId: 1
    },{
      radio: 'Both',
      radioTypes: ['5-GHz','2.4-GHz'],
      isDefault: false,
      apGroupId: '8ef01f614f1644d3869815aae82036b3',
      id: '9308685565fc47258f9adb5f09875bd0',
      apGroupName: 'bbb',
      vlanId: 1
    }]

    const newVenues = [
      {
        ...network.venues[0],
        scheduler: {
          type: 'CUSTOM',
          sun: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          mon: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          thu: '111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000',
          fri: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          sat: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        }
      },
      {
        ...network.venues[0],
        venueId: '02e2ddbc88e1428987666d31edbc3d9a',
        scheduler: {
          type: 'CUSTOM',
          sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          mon: '111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000',
          tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
        },
        isAllApGroups: false,
        apGroups: newAPGroups
      }
    ]

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [
          networkVenue_allAps,
          { ...networkVenue_apgroup, apGroups: newAPGroups }
        ] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [
          networkVenue_allAps,
          { ...networkVenue_apgroup, apGroups: newAPGroups }
        ] }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => {
          mockedGetApCompatibilitiesNetwork()
          return res(ctx.json(networkVenueApCompatibilities))
        }
      )
    )

    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00'))) // Australian Eastern Standard Time

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toHaveBeenCalled())

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /network-venue-1/i })).toBeVisible()
    expect(within(rows[2]).getByRole('cell', { name: /My-Venue/i })).toBeVisible()

    expect(rows[2]).toHaveTextContent('2 AP Groups')
    expect(rows[2]).toHaveTextContent('Per AP Group')

    expect(rows[1]).toHaveTextContent('ON now') // { day: 'Thu', timeIndex: 5 }
    expect(rows[2]).toHaveTextContent('OFF now')  // { day: 'Wed', timeIndex: 45 }

    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it.skip('has specific AP groups', async () => {

    const newVenues = [
      {
        ...network.venues[0],
        isAllApGroups: false,
        apGroups: [{
          radio: 'Both',
          radioTypes: ['5-GHz','2.4-GHz', '6-GHz'],
          isDefault: false,
          apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
          id: '6cb1e831973a4d60924ac59f1bda073c',
          apGroupName: 'APG1'
        }],
        scheduler: {
          type: 'ALWAYS_OFF'
        }
      }
    ]

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [
          { ...networkVenue_allAps, apGroups: newVenues[0].apGroups },
          networkVenue_apgroup
        ] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [
          { ...networkVenue_allAps, apGroups: newVenues[0].apGroups },
          networkVenue_apgroup
        ] }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => res(ctx.json(networkVenueApCompatibilities))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })

    const row = await screen.findByRole('row', { name: /network-venue-1/i })

    expect(row).toHaveTextContent('APG1')
    expect(row).toHaveTextContent('All')
    expect(row).toHaveTextContent('VLAN-1 (Custom)')

    fireEvent.click(within(row).getByText('APG1'))
    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    fireEvent.click(within(row).getByText('VLAN-1 (Custom)'))
    // Switch to 'All APs' radio
    fireEvent.click(within(dialog).getByLabelText('All APs', { exact: false }))

    // Switch to 'AP groups' radio
    fireEvent.click(within(dialog).getByLabelText('Select specific AP groups', { exact: false }))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(mockedApplyFn).toBeCalled()
    })
  })


  it('setup NetworkApGroupDialog', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_apgroup] }))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_apgroup] }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => res(ctx.json(networkVenueApCompatibilities))
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /network-venue-1/i })

    await userEvent.click(within(row).getByText('All APs'))
    await userEvent.click(within(row).getByText('VLAN-1 (Default)'))
    await userEvent.click(within(row).getByText('2.4 GHz, 5 GHz'))

    const dialog = await screen.findByTestId('NetworkApGroupDialog')
    await waitFor(() => expect(dialog).toBeVisible())

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should trigger NetworkSchedulingDialog', async () => {
    const newVenues = [
      {
        ...network.venues[0],
        scheduler: {
          type: 'CUSTOM',
          sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          mon: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          tue: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          wed: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
          sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
        }
      }
    ]

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json({ ...network, venues: newVenues }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => {
          mockedGetApCompatibilitiesNetwork()
          return res(ctx.json(networkVenueApCompatibilities))
        }
      )
    )

    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(2))

    const row = await screen.findByRole('row', { name: /network-venue-1/i })
    // currentTimeIdx:  { day: 'Wed', timeIndex: 65 } > ON now
    await userEvent.click(within(row).getByText(/ON now/i))

    const dialog = await screen.findByTestId('NetworkVenueScheduleDialog')
    await waitFor(() => expect(dialog).toBeVisible())
  })
})

describe('WIFI_RBAC_API is turned on', () => {
  const mockedNetworks = cloneDeep(mockedRbacWifiNetworkList)
  mockedNetworks[0].venueApGroups[1].venueId = list.data[0].id
  const mockedGetWifiNetwork = jest.fn()

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API || !disabledFFs.includes(ff as Features))

    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockedGetWifiNetwork.mockClear()
    mockedGetApCompatibilitiesNetwork.mockClear()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json({ data: [networkVenue_allAps, networkVenue_apgroup] }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.post(
        CommonUrlsInfo.getVenueCityList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (req, res, ctx) => {
          mockedGetApCompatibilitiesNetwork()
          return res(ctx.json(networkVenueApCompatibilities))
        }
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: vlanPoolList }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => {
          mockedGetWifiNetwork()
          return res(ctx.json({ data: mockedNetworks }))
        }
      )
    )
  })

  it('should trigger RBAC API when WIFI_RBAC turned on', async () => {
    render(<Provider><NetworkVenuesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/:networkId' }
    })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedGetApCompatibilitiesNetwork).toBeCalledTimes(2))
    expect(mockedGetWifiNetwork).toHaveBeenCalled()
    const row = await screen.findByRole('row', { name: /network-venue-1/i })
    expect(row).toHaveTextContent('VLAN-1 (Default)')
    expect(row).toHaveTextContent('All APs')
    expect(row).toHaveTextContent('24/7')
    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
  })
})

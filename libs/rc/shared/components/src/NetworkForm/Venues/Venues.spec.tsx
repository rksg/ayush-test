import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import {
  BasicServiceSetPriorityEnum,
  CommonUrlsInfo,
  NetworkTypeEnum,
  WlanSecurityEnum,
  PhyTypeConstraintEnum,
  RfBandUsageEnum,
  ManagementFrameMinimumPhyRateEnum,
  BssMinimumPhyRateEnum,
  ConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { act, findTBody, fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { useSdLanScopedNetworkVenues }                     from '../../EdgeSdLan/useEdgeSdLanActions'
import { list, networkVenue_allAps, networkVenue_apgroup } from '../__tests__/fixtures'
import NetworkFormContext                                  from '../NetworkFormContext'

import { Venues } from './Venues'

jest.mock('socket.io-client')

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
    networkVenueIds: []
  })
}))

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { venues: [] }, setData: ()=>{}
    }}>
      <Form>
        {children}
      </Form>
    </NetworkFormContext.Provider>
  </Provider>
}

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('Create Network: Venues Step', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json({ response: [networkVenue_allAps, networkVenue_apgroup] }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <NetworkFormContext.Provider value={{
        editMode: false, cloneMode: false,
        data: {
          venues: [networkVenue_allAps, networkVenue_apgroup] ,
          name: 'dpsk',
          type: NetworkTypeEnum.DPSK,
          isCloudpathEnabled: false,
          enableAccountingProxy: false,
          enableAuthProxy: true,
          enableAccountingService: false,
          enableDhcp: true,
          wlan: {
            ssid: 'dpsk',
            wlanSecurity: WlanSecurityEnum.WPA2Personal,
            enable: true,
            vlanId: 1,
            advancedCustomization: {
              devicePolicyId: undefined,
              l2AclPolicyId: undefined,
              l3AclPolicyId: undefined,
              applicationPolicyId: undefined,
              accessControlProfileId: undefined,
              userUplinkRateLimiting: 0,
              userDownlinkRateLimiting: 0,
              maxClientsOnWlanPerRadio: 100,
              enableBandBalancing: true,
              clientIsolation: false,
              clientIsolationOptions: {
                autoVrrp: false
              },
              hideSsid: false,
              forceMobileDeviceDhcp: false,
              clientLoadBalancingEnable: true,
              enableAaaVlanOverride: true,
              directedThreshold: 5,
              enableNeighborReport: true,
              radioCustomization: {
                rfBandUsage: RfBandUsageEnum.BOTH,
                phyTypeConstraint: PhyTypeConstraintEnum.NONE,
                managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum._6,
                bssMinimumPhyRate: BssMinimumPhyRateEnum._24
              },
              enableSyslog: false,
              clientInactivityTimeout: 120,
              accessControlEnable: false,
              respectiveAccessControl: true,
              vlanPool: null,
              applicationPolicyEnable: false,
              l2AclEnable: false,
              l3AclEnable: false,
              wifiCallingEnabled: false,
              wifiCallingIds: [],
              proxyARP: false,
              enableAirtimeDecongestion: false,
              enableJoinRSSIThreshold: false,
              joinRSSIThreshold: -85,
              enableTransientClientManagement: false,
              joinWaitTime: 30,
              joinExpireTime: 300,
              joinWaitThreshold: 10,
              enableOptimizedConnectivityExperience: false,
              broadcastProbeResponseDelay: 15,
              rssiAssociationRejectionThreshold: -75,
              enableAntiSpoofing: false,
              enableArpRequestRateLimit: true,
              arpRequestRateLimit: 15,
              enableDhcpRequestRateLimit: true,
              dhcpRequestRateLimit: 15,
              dnsProxyEnabled: false,
              dnsProxy: {
                dnsProxyRules: []
              },
              bssPriority: BasicServiceSetPriorityEnum.HIGH,
              dhcpOption82Enabled: false,
              dhcpOption82SubOption1Enabled: false,
              dhcpOption82SubOption1Format: null,
              dhcpOption82SubOption2Enabled: false,
              dhcpOption82SubOption2Format: null,
              dhcpOption82SubOption150Enabled: false,
              dhcpOption82SubOption151Enabled: false,
              dhcpOption82SubOption151Format: null,
              dhcpOption82MacFormat: null,
              enableMulticastUplinkRateLimiting: false,
              enableMulticastDownlinkRateLimiting: false,
              enableMulticastUplinkRateLimiting6G: false,
              enableMulticastDownlinkRateLimiting6G: false,
              wifi6Enabled: true,
              wifi7Enabled: true,
              multiLinkOperationEnabled: false,
              qosMapSetEnabled: false,
              qosMapSetOptions: {
                rules: []
              }
            }
          },
          dpskWlanSecurity: WlanSecurityEnum.WPA2Personal,
          dpskServiceProfileId: '709b239aeeff4efcb5a6ef83182bde95'
        }
      }}>
        <Form>
          <Venues />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    const row = await screen.findByRole('row', { name: /network-venue-1/i })
    fireEvent.click(within(row).getByText('All APs'))
    const dialog = await screen.findByTestId('NetworkApGroupDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    fireEvent.click(within(row).getByText('2.4 GHz, 5 GHz'))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(dialog).not.toBeVisible())

    fireEvent.click(within(row).getByText('24/7'))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should render clone mode correctly', async () => {
    render(<Provider>
      <NetworkFormContext.Provider value={{
        editMode: false, cloneMode: true,
        data: { venues: [networkVenue_allAps, networkVenue_apgroup] }
      }}>
        <Form>
          <Venues />
        </Form>
      </NetworkFormContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/:networkId' }
    })

    const row = await screen.findByRole('row', { name: /network-venue-1/i })
    fireEvent.click(within(row).getByText('24/7'))

    const dialog = await screen.findByTestId('NetworkVenueScheduleDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('Activate and Deactivate Network by toogleButton', async () => {
    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const toogleButton = rows[0]
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).toBeChecked())
    fireEvent.click(toogleButton)
    await waitFor(() => expect(toogleButton).not.toBeChecked())
  })

  it('Table action bar activate Network', async () => {
    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    const row = await body.findByRole('row', { name: /My-Venue/ })
    await userEvent.click(within(row).getByRole('checkbox'))
    const activateButton = await screen.findByRole('button', { name: 'Activate' })
    fireEvent.click(activateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const selectRow = rows[1]
    await waitFor(() => expect(selectRow).toBeChecked())
  })

  it('Table action bar deactivate Network', async () => {
    render(<Venues />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('My-Venue'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateButton)

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

  it('Default activate Network', async () => {
    render(<Venues defaultActiveVenues={[list.data[0].id]} />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()
    await within(tbody).findByRole('row', { name: /network-venue-1/ })
    const rows = await within(tbody).findAllByRole('switch')
    expect(rows).toHaveLength(2)
    const toogleButton = rows[0]
    await waitFor(() => expect(toogleButton).toBeChecked())
  })

  it('confirm deactivate when SD-LAN is scoped in the selected network', async () => {
    jest.mocked(useSdLanScopedNetworkVenues).mockReturnValue({
      sdLansVenueMap: {},
      networkVenueIds: ['02e2ddbc88e1428987666d31edbc3d9a'],
      guestNetworkVenueIds: []
    })

    render(<Venues defaultActiveVenues={[list.data[0].id]} />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()
    const activatedRow = await within(tbody).findByRole('row', { name: /My-Venue/ })
    await userEvent.click(await within(activatedRow).findByRole('checkbox'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    await userEvent.click(deactivateButton)
    const popup = await screen.findByRole('dialog')
    await screen.findByText(/This network is running the SD-LAN service on this venue/i)
    await userEvent.click( await within(popup).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(popup).not.toBeVisible())
  })

  it('should greyout when the WLAN is the last one in SDLAN', async () => {
    jest.mocked(useSdLanScopedNetworkVenues).mockReturnValue({
      sdLansVenueMap: {},
      networkVenueIds: ['02e2ddbc88e1428987666d31edbc3d9a'],
      guestNetworkVenueIds: []
    })

    render(<Venues defaultActiveVenues={[list.data[0].id]} />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = await findTBody()
    const activatedRow = await within(tbody).findByRole('row', { name: /My-Venue/ })
    await userEvent.click(await within(activatedRow).findByRole('checkbox'))
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' })
    await userEvent.click(deactivateButton)
    const popup = await screen.findByRole('dialog')
    await screen.findByText(/This network is running the SD-LAN service on this venue/i)
    await userEvent.click( await within(popup).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(popup).not.toBeVisible())
  })
})

import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { EdgeSdLanFixtures, Network, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import { mockNetworkViewmodelList } from './__tests__/fixtures'

import EdgeSdLan from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const mockedEdgeSdLanDmz = mockedSdLanDataListP2[0]
const mockedEdgeSdLanDc = mockedSdLanDataListP2[1]
const guestNetwork = _.find(mockNetworkViewmodelList, { nwSubType: NetworkTypeEnum.CAPTIVEPORTAL })

const mockedActivateNetworkReq = jest.fn()
const mockedDeactivateNetworkReq = jest.fn()
const mockedGetData = jest.fn()

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeSdLanP2ActivatedNetworksTable: (props:
    { isUpdating: boolean,
      onActivateChange: (fieldName: string,
      rowData: Network,
      checked: boolean,
      activated: string[])=> void }) => {

    const mockedData = mockedGetData()
    const onClick = () => {
      props.onActivateChange.apply(null, mockedData)
    }
    return <div data-testid='EdgeSdLanP2ActivatedNetworksTable'>
      {
        props.isUpdating
          ? <div data-testid='rc-loading'/>
          :<button onClick={onClick}>toggle</button>
      }
    </div>
  }
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useActivateEdgeSdLanNetworkMutation: () => {
    return [(req: RequestPayload) => {
      mockedActivateNetworkReq(req.params, req.payload)

      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)?.({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    }, { isLoading: false }]
  },
  useDeactivateEdgeSdLanNetworkMutation: () => {
    return [(req: RequestPayload) => {
      mockedDeactivateNetworkReq(req.params)

      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)?.()
        }, 300)
      }) }
    }, { isLoading: false }]
  }
}))

describe('Venue Edge SD-LAN Service Phase2', () => {
  let params: { tenantId: string, venueId: string }

  beforeEach(() => {
    params = {
      tenantId: 't-tenant',
      venueId: 't-venue'
    }

    mockedActivateNetworkReq.mockReset()
    mockedDeactivateNetworkReq.mockReset()
    mockedGetData.mockReset()
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeSdLan data={mockedEdgeSdLanDc} />
      </Provider>, {
        route: { params }
      })

    // display config data
    expect(await screen.findByRole('link', { name: 'Mocked_SDLAN_2' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked-Venue-2' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SE_Cluster 1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked_tunnel-2' })).toBeVisible()
    screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
  })

  it('should render DMZ scenario correctly', async () => {
    render(
      <Provider>
        <EdgeSdLan data={mockedEdgeSdLanDmz} />
      </Provider>, {
        route: { params }
      })

    // display config data
    expect(await screen.findByRole('link', { name: 'Mocked_SDLAN_1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked-Venue-1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SE_Cluster 0' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked_tunnel-1' })).toBeVisible()
    screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
  })

  describe('toggle traffic network', () => {
    it('deactivate non-guest network tunneled to DC', async () => {
      mockedGetData.mockReturnValue([
        'activatedNetworks',
        _.find(mockNetworkViewmodelList, { id: 'network_1' }),
        false,
        ['network_4']
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedEdgeSdLanDmz} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        serviceId: 'mocked-sd-lan-1',
        wifiNetworkId: 'network_1'
      })
    })
    it('activate non-guest network tunneled to DC', async () => {
      mockedGetData.mockReturnValue([
        'activatedNetworks',
        _.find(mockNetworkViewmodelList, { id: 'network_2' }),
        true,
        mockNetworkViewmodelList.filter(item => item.id !== 'network_3').map(i => i.id)
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedEdgeSdLanDmz} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        serviceId: 'mocked-sd-lan-1',
        wifiNetworkId: 'network_2'
      }, { isGuestTunnelUtilized: false })
    })

    it('deactivate DMZ network', async () => {
      mockedGetData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        false,
        []
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedEdgeSdLanDmz} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked-sd-lan-1'
      }, { isGuestTunnelUtilized: false })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })
    it('activate DMZ network and its DC network is activated', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoGuestTraffic.guestNetworkIds = []

      mockedGetData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        true,
        [guestNetwork]
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedNoGuestTraffic} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked-sd-lan-1'
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })

    it('activate DMZ network and its DC network is Not activated', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoGuestTraffic.networkIds = mockedNoGuestTraffic.networkIds
        .filter(item => item !== guestNetwork?.id)
      mockedNoGuestTraffic.guestNetworkIds = []

      mockedGetData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        true,
        [guestNetwork]
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedNoGuestTraffic} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked-sd-lan-1'
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })
    it('activate DC guest network and its DMZ network is Not activated', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoGuestTraffic.networkIds = mockedNoGuestTraffic.networkIds
        .filter(item => item !== guestNetwork?.id)
      mockedNoGuestTraffic.guestNetworkIds = []

      mockedGetData.mockReturnValue([
        'activatedNetworks',
        guestNetwork,
        true,
        // network1,4
        ['network_1', 'network_4']
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedNoGuestTraffic} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedActivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked-sd-lan-1'
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })
    it('deactivate DC guest network and its DMZ network is activated', async () => {
      const mockedHasGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedHasGuestTraffic.networkIds.push('network_4')

      mockedGetData.mockReturnValue([
        'activatedNetworks',
        guestNetwork,
        false,
        ['network_1']
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedEdgeSdLanDmz} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked-sd-lan-1'
      })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })
    it('deactivate DC guest network and DMZ network is Not activated', async () => {
      const mockedNoDMZGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoDMZGuestTraffic.guestNetworkIds = []

      mockedGetData.mockReturnValue([
        'activatedNetworks',
        guestNetwork,
        false,
        ['network_1']
      ])

      render(
        <Provider>
          <EdgeSdLan data={mockedNoDMZGuestTraffic} />
        </Provider>, {
          route: { params }
        })

      const loadingText = await basicActsTestToggleNetwork()
      await waitFor(() => expect(loadingText).not.toBeVisible())
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        wifiNetworkId: 'network_4',
        serviceId: 'mocked-sd-lan-1'
      })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })
  })
})

const basicActsTestToggleNetwork = async (): Promise<HTMLElement> => {
  await screen.findByRole('link', { name: 'Mocked_SDLAN_1' })
  const networkTable = screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
  await userEvent.click(within(networkTable).getByRole('button'))
  return within(networkTable).getByTestId('rc-loading')
}
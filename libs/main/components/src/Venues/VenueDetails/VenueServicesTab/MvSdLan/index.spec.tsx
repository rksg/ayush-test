import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { EdgeMvSdLanViewData, EdgeSdLanFixtures, EdgeSdLanTunneledWlan, Network, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import { mockNetworkViewmodelList } from './__tests__/fixtures'

import EdgeMvSdLan from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const mockedEdgeSdLanDmz = mockedMvSdLanDataList[0]
const guestNetwork = _.find(mockNetworkViewmodelList, { nwSubType: NetworkTypeEnum.CAPTIVEPORTAL })
const mockedSdLanVenueId = mockedEdgeSdLanDmz.tunneledWlans![0].venueId

const mockedActivateNetworkReq = jest.fn()
const mockedDeactivateNetworkReq = jest.fn()
const mockedSubmitData = jest.fn()
const mockedDisableFnParams = jest.fn()

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeSdLanP2ActivatedNetworksTable: (props:
    { isUpdating: boolean,
      disabled: Function,
      onActivateChange: (fieldName: string,
        rowData: Network,
        checked: boolean,
        activated: string[])=> void
    }
  ) => {
    const mockedData = mockedSubmitData()
    const mockedDisableFnParamsData = mockedDisableFnParams()
    // eslint-disable-next-line max-len
    const disabledInfo = mockedDisableFnParamsData ? props.disabled.apply(null, mockedDisableFnParamsData) : undefined

    const onClick = () => {
      props.onActivateChange.apply(null, mockedData)
    }
    return <div data-testid='EdgeSdLanP2ActivatedNetworksTable'>
      {
        props.isUpdating
          ? <div data-testid='rc-loading'/>
          : <>
            <span>tooltip:{disabledInfo?.tooltip}</span>
            <button disabled={disabledInfo?.isDisabled} onClick={onClick}>toggle</button>
          </>
      }
    </div>
  }
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useActivateEdgeMvSdLanNetworkMutation: () => {
    return [(req: RequestPayload) => {
      mockedActivateNetworkReq(req.params, req.payload)

      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    }, { isLoading: false }]
  },
  useDeactivateEdgeMvSdLanNetworkMutation: () => {
    return [(req: RequestPayload) => {
      mockedDeactivateNetworkReq(req.params)

      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)()
        }, 300)
      }) }
    }, { isLoading: false }]
  }
}))

const renderTestComponent = ({ params, sdLan }:
  { params: { tenantId: string, venueId: string }, sdLan: EdgeMvSdLanViewData }) => {
  render(
    <Provider>
      <EdgeMvSdLan data={sdLan} />
    </Provider>, {
      route: { params }
    })
}
describe('Venue Edge SD-LAN Service - Multi-venue', () => {
  let params: { tenantId: string, venueId: string } = {
    tenantId: 't-tenant',
    venueId: mockedSdLanVenueId
  }

  const defaultExpectedReqParams = {
    venueId: params.venueId,
    serviceId: mockedEdgeSdLanDmz.id
  }

  beforeEach(() => {
    mockedActivateNetworkReq.mockReset()
    mockedDeactivateNetworkReq.mockReset()
    mockedSubmitData.mockReset()
    mockedDisableFnParams.mockReturnValue(undefined)
  })

  it('should render correctly', async () => {
    const mockedEdgeSdLanDc = mockedMvSdLanDataList[1]
    renderTestComponent({ params, sdLan: mockedEdgeSdLanDc })

    // display config data
    expect(await screen.findByRole('link', { name: 'Mocked_SDLAN_2' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SE_Cluster 1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked_tunnel-2' })).toBeVisible()
    screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
  })

  it('should render DMZ scenario correctly', async () => {
    renderTestComponent({ params, sdLan: mockedEdgeSdLanDmz })

    // display config data
    expect(await screen.findByRole('link', { name: 'Mocked_SDLAN_1' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SE_Cluster 0' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mocked_tunnel-1' })).toBeVisible()
    screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
  })

  describe('toggle traffic network', () => {
    it('deactivate non-guest network tunneled to DC', async () => {
      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        _.find(mockNetworkViewmodelList, { id: 'network_1' }),
        false,
        ['network_4']
      ])

      renderTestComponent({ params, sdLan: mockedEdgeSdLanDmz })

      await basicActsTestToggleNetwork()
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_1'
      })
    })
    it('activate non-guest network tunneled to DC', async () => {
      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        _.find(mockNetworkViewmodelList, { id: 'network_2' }),
        true,
        mockNetworkViewmodelList.filter(item => item.id !== 'network_3').map(i => i.id)
      ])

      renderTestComponent({ params, sdLan: mockedEdgeSdLanDmz })

      await basicActsTestToggleNetwork()
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_2'
      }, { isGuestTunnelUtilized: false })
    })

    it('deactivate DMZ network', async () => {
      mockedSubmitData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        false,
        []
      ])

      renderTestComponent({ params, sdLan: mockedEdgeSdLanDmz })

      await basicActsTestToggleNetwork()
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_4'
      }, { isGuestTunnelUtilized: false })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })
    it('activate DMZ network and its DC network is activated', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoGuestTraffic.tunneledGuestWlans = []

      mockedSubmitData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        true,
        [guestNetwork]
      ])

      renderTestComponent({ params, sdLan: mockedNoGuestTraffic })

      await basicActsTestToggleNetwork()
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_4'
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })

    it('activate DMZ network and its DC network is Not activated', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoGuestTraffic.tunneledWlans = mockedNoGuestTraffic.tunneledWlans!
        .filter(item => item.networkId !== guestNetwork?.id)
      mockedNoGuestTraffic.tunneledGuestWlans = []

      mockedSubmitData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        true,
        [guestNetwork]
      ])

      renderTestComponent({
        params,
        sdLan: mockedNoGuestTraffic
      })

      await basicActsTestToggleNetwork()
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_4'
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })
    it('activate DC guest network and its DMZ network is Not activated', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoGuestTraffic.tunneledWlans = mockedNoGuestTraffic.tunneledWlans!
        .filter(item => item.networkId !== guestNetwork?.id)
      mockedNoGuestTraffic.tunneledGuestWlans = []

      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        guestNetwork,
        true,
        ['network_1', 'network_4']
      ])

      renderTestComponent({ params, sdLan: mockedNoGuestTraffic })

      await basicActsTestToggleNetwork()
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_4'
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
    })
    it('deactivate DC guest network and its DMZ network is activated', async () => {
      const mockedHasGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedHasGuestTraffic.tunneledWlans!.push({ networkId: 'network_4', networkName: 'network_4',
        venueId: mockedEdgeSdLanDmz.tunneledWlans![0].venueId
      } as EdgeSdLanTunneledWlan)

      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        guestNetwork,
        false,
        ['network_1']
      ])

      renderTestComponent({ params, sdLan: mockedEdgeSdLanDmz })

      await basicActsTestToggleNetwork()
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_4'
      })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })
    it('deactivate DC guest network and DMZ network is Not activated', async () => {
      const mockedNoDMZGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      mockedNoDMZGuestTraffic.tunneledGuestWlans = []

      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        guestNetwork,
        false,
        ['network_1']
      ])

      renderTestComponent({ params, sdLan: mockedNoDMZGuestTraffic })

      await basicActsTestToggleNetwork()
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: 'network_4'
      })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })

    // eslint-disable-next-line max-len
    it('should popup confirm when the WLAN is the last one in this venue of current SDLAN', async () => {
      const mockedEdgeSdLanDc = mockedMvSdLanDataList[1]
      const targetNetwork = _.find(mockNetworkViewmodelList, { id: 'network_2' })
      const currentVenueId = mockedEdgeSdLanDc.tunneledWlans![0].venueId

      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        targetNetwork,
        false,
        ['network_1']
      ])
      mockedDisableFnParams.mockReturnValue([
        currentVenueId,
        targetNetwork,
        false
      ])

      renderTestComponent({
        params: { ...params, venueId: currentVenueId },
        sdLan: mockedEdgeSdLanDc
      })

      await screen.findByRole('link', { name: 'Mocked_SDLAN_2' })
      const networkTable = screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
      const btn = within(networkTable).getByRole('button')
      expect(btn).not.toBeDisabled()
      await userEvent.click(btn)
      const dialog = await screen.findByRole('dialog')
      expect(dialog).toBeVisible()
      expect(screen.getByText('Confirm venue deassociation')).toBeVisible()
      await userEvent.click(within(dialog).getByRole('button', { name: 'Continue' }))
      expect(mockedDeactivateNetworkReq).toBeCalledWith({
        venueId: currentVenueId,
        serviceId: mockedEdgeSdLanDc.id,
        wifiNetworkId: targetNetwork?.id
      })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should greyout when the WLAN is the last one in SDLAN', async () => {
      const mockedEdgeSdLanDc = _.cloneDeep(mockedMvSdLanDataList[1])
      mockedEdgeSdLanDc.tunneledWlans = mockedEdgeSdLanDc.tunneledWlans!.slice(0, 1)
      // eslint-disable-next-line max-len
      const targetNetwork = _.find(mockNetworkViewmodelList, { id: mockedEdgeSdLanDc.tunneledWlans[0].networkId })

      mockedSubmitData.mockReturnValue([
        'activatedNetworks',
        targetNetwork,
        false,
        ['network_1']
      ])
      mockedDisableFnParams.mockReturnValue([
        'mock_venue',
        targetNetwork,
        false
      ])

      renderTestComponent({ params, sdLan: mockedEdgeSdLanDc })

      await screen.findByRole('link', { name: 'Mocked_SDLAN_2' })
      const networkTable = screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
      expect(within(networkTable).getByRole('button')).toBeDisabled()
      // eslint-disable-next-line max-len
      expect(within(networkTable).getByText('tooltip:Cannot deactivate the last WLAN in SD-LAN')).toBeVisible()
    })

    // eslint-disable-next-line max-len
    it('should popup conflict when activate guest forward network which is already DC network in another venue', async () => {
      const mockedNoGuestTraffic = _.cloneDeep(mockedEdgeSdLanDmz)
      const targetNetworkIdx = mockedNoGuestTraffic.tunneledWlans!
        .findIndex(item => item.networkId === guestNetwork?.id)
      mockedNoGuestTraffic.tunneledWlans![targetNetworkIdx].venueId = 'other_venue'
      mockedNoGuestTraffic.tunneledGuestWlans = []

      mockedSubmitData.mockReturnValue([
        'activatedGuestNetworks',
        guestNetwork,
        true,
        [guestNetwork]
      ])

      renderTestComponent({
        params,
        sdLan: mockedNoGuestTraffic
      })

      await screen.findByRole('link', { name: 'Mocked_SDLAN_1' })
      const networkTable = screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
      const btn = within(networkTable).getByRole('button')
      expect(btn).not.toBeDisabled()
      await userEvent.click(btn)
      const dialog = await screen.findByRole('dialog')
      expect(dialog).toBeVisible()
      expect(screen.queryByText(/setting must be consistent across all venues/)).toBeVisible()
      await userEvent.click(within(dialog).getByRole('button', { name: 'Continue' }))
      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        wifiNetworkId: guestNetwork?.id
      }, { isGuestTunnelUtilized: true })
      expect(mockedActivateNetworkReq).toBeCalledWith({
        ...defaultExpectedReqParams,
        venueId: 'other_venue',
        wifiNetworkId: guestNetwork?.id
      }, { isGuestTunnelUtilized: true })
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      await waitFor(() => expect(dialog).not.toBeVisible())
    })
  })
})

const basicActsTestToggleNetwork = async () => {
  await screen.findByRole('link', { name: 'Mocked_SDLAN_1' })
  const networkTable = screen.getByTestId('EdgeSdLanP2ActivatedNetworksTable')
  await userEvent.click(within(networkTable).getByRole('button'))
  const loadingText = within(networkTable).getByTestId('rc-loading')
  await waitFor(() => expect(loadingText).not.toBeVisible())
}
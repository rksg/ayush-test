import { Modal } from 'antd'

import { networkApi, useNetworkListQuery }                                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, Network, TABLE_QUERY, useTableQuery, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import { fireEvent, mockRestApiQuery, render, screen }                       from '@acx-ui/test-utils'
import { RequestPayload }                                                    from '@acx-ui/types'

import { NetworkTable, defaultNetworkPayload  } from '.'

const mockedUseNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate
}))

const list = {
  totalCount: 10,
  page: 1,
  data: [
    {
      aps: 1,
      clients: 0,
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      nwSubType: 'psk',
      ssid: '01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      count: 3,
      names: ['pingtung', 'My-Venue', '101'],
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'ClickThrough',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8798',
      name: 'network-02',
      nwSubType: 'guest',
      ssid: '02',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 1,
      clients: 0,
      id: '373377b0cb6e46ea8982b1c80aabe1fa',
      name: 'network-03',
      nwSubType: 'aaa',
      ssid: '03',
      venues: { count: 2, names: ['101', 'My-Venue'] },
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'GuestPass',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8898',
      name: 'network-04',
      nwSubType: 'guest',
      ssid: '04',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 1,
      clients: 0,
      id: '373377b0cb6e46ea8982b1c80aabe2fa',
      name: 'network-05',
      nwSubType: 'dpsk',
      ssid: '05',
      venues: { count: 1, names: ['My-Venue'] },
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'SelfSignIn',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8998',
      name: 'network-06',
      nwSubType: 'guest',
      ssid: '06',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 0,
      captiveType: 'HostApproval',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd9098',
      name: 'network-07',
      nwSubType: 'guest',
      ssid: '07',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 0,
      captiveType: 'WISPr',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd9198',
      name: 'network-08',
      nwSubType: 'guest',
      ssid: '08',
      venues: { count: 0, names: [] },
      vlan: 1
    },
    {
      aps: 0,
      clients: 0,
      description: '',
      id: '3c62b3818d194022b8dd35852c66f646',
      name: 'network-09',
      nwSubType: 'open',
      ssid: '09',
      venues: { count: 0, names: [] },
      vlan: 2,
      vlanPool: {}
    },
    {
      aps: 0,
      captiveType: '',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd9398',
      name: 'network-10',
      nwSubType: 'guest',
      ssid: '10',
      venues: { count: 0, names: [] },
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: ''
        }
      },
      vlanPool: {
        name: 'test'
      }
    }
  ]
}

describe('NetworkTable', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getVMNetworksList.url, 'post', { ...list })
    mockRestApiQuery(
      WifiUrlsInfo.deleteNetwork.url, 'delete', { data: { requestId: 'network-01' } }
    )
    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', { data: [] })
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockedUseNavigate.mockClear()
  })
  afterEach(()=>{
    Modal.destroyAll()
  })

  afterAll(() => mockedUseNavigate.mockReset())

  const NetworkTableWrapper = ({ option, selectable }:
    { option: TABLE_QUERY<Network, RequestPayload<unknown>, unknown>,
      selectable: boolean
    }) => {
    const tableQuery = useTableQuery(option)
    return <NetworkTable tableQuery={tableQuery} selectable={selectable}/>
  }

  it('should render table', async () => {

    await store.dispatch(
      networkApi.endpoints.networkList.initiate({
        ...defaultNetworkPayload,
        params
      })
    )

    render(
      <Provider>
        <NetworkTableWrapper
          selectable={true}
          option={{
            useQuery: useNetworkListQuery,
            defaultPayload: defaultNetworkPayload }}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      }
    )

    expect(await screen.findByText(/network-01/i)).toBeInTheDocument()
  })

  it('should render table with selectable=false', async () => {

    await store.dispatch(
      networkApi.endpoints.networkList.initiate({
        ...defaultNetworkPayload,
        params
      })
    )

    render(
      <Provider>
        <NetworkTableWrapper
          selectable={false}
          option={{
            useQuery: useNetworkListQuery,
            defaultPayload: defaultNetworkPayload }}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      }
    )

    expect(await screen.findByText(/network-01/i)).toBeInTheDocument()
  })

  it('should handle clone/edit action', async () => {

    await store.dispatch(
      networkApi.endpoints.networkList.initiate({
        ...defaultNetworkPayload,
        params
      })
    )

    render(
      <Provider>
        <NetworkTableWrapper
          selectable={true}
          option={{
            useQuery: useNetworkListQuery,
            defaultPayload: defaultNetworkPayload }}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      }
    )

    const vlans = await screen.findAllByText(/VLAN-1/i)
    expect(vlans).toHaveLength(8)
    fireEvent.click(vlans[0])
    fireEvent.click(await screen.findByText(/Edit/i))
    expect(mockedUseNavigate).toBeCalledTimes(1)
    // eslint-disable-next-line max-len
    expect(mockedUseNavigate).toBeCalledWith('/ecc2d7cf9d2342fdb31ae0e24958fcac/t/networks/wireless/c9d5f4c771c34ad2898f7078cebbb191/edit', { replace: false })

    fireEvent.click(await screen.findByText(/Clone/i))
    expect(mockedUseNavigate).toBeCalledTimes(2)
    // eslint-disable-next-line max-len
    expect(mockedUseNavigate).toHaveBeenLastCalledWith('/ecc2d7cf9d2342fdb31ae0e24958fcac/t/networks/wireless/c9d5f4c771c34ad2898f7078cebbb191/clone', { replace: false })

  })

  it('should handle delete action', async () => {

    await store.dispatch(
      networkApi.endpoints.networkList.initiate({
        ...defaultNetworkPayload,
        params
      })
    )

    render(
      <Provider>
        <NetworkTableWrapper
          selectable={true}
          option={{
            useQuery: useNetworkListQuery,
            defaultPayload: defaultNetworkPayload }}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/networks' }
      }
    )

    const vlans = await screen.findAllByText(/VLAN-1/i)
    expect(vlans).toHaveLength(8)
    fireEvent.click(vlans[0])
    fireEvent.click(await screen.findByText(/Delete/i))

    const deleteMsgs = await screen.findAllByText(/Are you sure you want to delete/i)
    expect(deleteMsgs.length).toBeGreaterThan(0)
  })

})
